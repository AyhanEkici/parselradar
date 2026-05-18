import fs from 'fs';
import path from 'path';
import { parseExpressRouterFile, parseIndexMounts, repoPath } from '../apps/api/src/testing/platformVerification';

type CheckStatus = 'PASS' | 'FAIL';

type CheckResult = {
  status: CheckStatus;
  name: string;
  detail?: string;
};

function readText(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

function fmt(result: CheckResult): string {
  return `${result.status} | ${result.name}${result.detail ? ` | ${result.detail}` : ''}`;
}

function failCount(results: CheckResult[]): number {
  return results.filter((r) => r.status === 'FAIL').length;
}

function normalizeSlash(p: string): string {
  return p.replace(/\\/g, '/');
}

function main() {
  const results: CheckResult[] = [];

  const indexPath = repoPath('apps', 'api', 'src', 'index.ts');
  const adminRoutesPath = repoPath('apps', 'api', 'src', 'routes', 'adminRoutes.ts');
  const observabilityRoutesPath = repoPath('apps', 'api', 'src', 'routes', 'observabilityRoutes.ts');
  const connectorActivationRoutesPath = repoPath('apps', 'api', 'src', 'routes', 'connectorActivationRoutes.ts');

  for (const required of [indexPath, adminRoutesPath, observabilityRoutesPath, connectorActivationRoutesPath]) {
    results.push({
      status: fileExists(required) ? 'PASS' : 'FAIL',
      name: `File exists: ${normalizeSlash(path.relative(repoPath(), required))}`,
    });
  }

  const mounts = fileExists(indexPath) ? parseIndexMounts(readText(indexPath)) : [];
  const expectedMounts: Array<{ symbol: string; mountPath: string }> = [
    { symbol: 'observabilityRoutes', mountPath: '/' },
    { symbol: 'connectorActivationRoutes', mountPath: '/' },
    { symbol: 'adminRoutes', mountPath: '/admin' },
  ];

  for (const mount of expectedMounts) {
    const ok = mounts.some((m) => m.symbol === mount.symbol && m.mountPath === mount.mountPath);
    results.push({
      status: ok ? 'PASS' : 'FAIL',
      name: `Mounted: ${mount.symbol} at ${mount.mountPath}`,
      detail: ok ? 'Found in apps/api/src/index.ts' : 'Missing mount in apps/api/src/index.ts',
    });
  }

  const adminRouteChecks = [
    ...parseExpressRouterFile('admin', adminRoutesPath, '/admin'),
    ...parseExpressRouterFile('observability', observabilityRoutesPath, '/'),
    ...parseExpressRouterFile('connectors', connectorActivationRoutesPath, '/'),
  ];

  const expectedRoutes = [
    { method: 'GET' as const, path: '/admin/observability' },
    { method: 'GET' as const, path: '/admin/analytics' },
    { method: 'GET' as const, path: '/admin/telemetry' },
    { method: 'GET' as const, path: '/admin/connectors' },
    { method: 'GET' as const, path: '/admin/deployment' },
    { method: 'GET' as const, path: '/admin/runtime' },
  ];

  for (const expected of expectedRoutes) {
    const found = adminRouteChecks.find((r) => r.method === expected.method && r.path === expected.path);
    results.push({
      status: found ? 'PASS' : 'FAIL',
      name: `Route declared: ${expected.method} ${expected.path}`,
      detail: found ? `in ${found.routeFile}` : 'Not found in router files',
    });

    if (found) {
      results.push({
        status: found.requiresAuth && found.requiresAdmin ? 'PASS' : 'FAIL',
        name: `Route gated: ${expected.method} ${expected.path}`,
        detail: found.requiresAuth && found.requiresAdmin ? 'auth+admin detected' : 'auth/admin middleware not detected',
      });
    }
  }

  process.stdout.write(`check:admin-routes | total=${results.length} | fail=${failCount(results)}\n`);
  for (const r of results) process.stdout.write(`${fmt(r)}\n`);

  if (failCount(results) > 0) process.exit(1);
}

main();

