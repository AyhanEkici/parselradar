import fs from 'fs';
import path from 'path';

type Check = { name: string; status: 'PASS' | 'FAIL'; detail: string };

type RuntimeProof = {
  flows?: {
    adminRouteTraversal?: { status?: string; detail?: string };
  };
};

const ROOT = process.cwd();
const runtimePath = path.join(ROOT, 'proof', 'live-browser-mvp-runtime.json');
const outJson = path.join(ROOT, 'proof', 'protected-route-integrity.json');
const outMd = path.join(ROOT, 'proof', 'protected-route-integrity.md');

function readText(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function push(checks: Check[], name: string, pass: boolean, detail: string) {
  checks.push({ name, status: pass ? 'PASS' : 'FAIL', detail });
}

function main() {
  const checks: Check[] = [];

  const app = readText('apps/web/src/App.tsx');
  const gate = readText('apps/web/src/components/RoleGate.tsx');
  const reqAuth = readText('apps/web/src/components/RequireAuth.tsx');
  const dashboard = readText('apps/web/src/pages/Dashboard.tsx');
  const credits = readText('apps/web/src/pages/Credits.tsx');

  push(checks, 'RequireAuth exists and redirects unauthenticated to /login', reqAuth.includes('Navigate to="/login"') && reqAuth.includes('authState === \'authenticating\''), 'Canonical guard should handle auth transitions.');
  push(checks, 'RoleGate does not block solely on storage session', !gate.includes('hasAuthSession('), 'Role checks must be based on canonical auth context only.');
  push(checks, 'Admin routes are wrapped by RequireAuth and AdminOnly', app.includes('<RequireAuth><AdminOnly><AdminUsers /></AdminOnly></RequireAuth>') && app.includes('<RequireAuth><AdminOnly><AdminProperties /></AdminOnly></RequireAuth>'), 'Admin route access should be explicit and deterministic.');
  push(
    checks,
    'Dashboard page does not use unauthenticated redirect effect',
    !dashboard.includes('if (!user &&') && !dashboard.includes("if (!user && !hasSession"),
    'Dashboard should not apply independent unauthenticated redirect logic.',
  );
  push(checks, 'Credits page does not use unauthenticated redirect effect', !credits.includes('if (!user &&') && !credits.includes("if (!user && !hasSession"), 'Credits should not apply independent unauthenticated redirect logic.');

  if (!fs.existsSync(runtimePath)) {
    push(checks, 'Runtime proof exists', false, 'Missing proof/live-browser-mvp-runtime.json');
  } else {
    const runtime = JSON.parse(fs.readFileSync(runtimePath, 'utf8')) as RuntimeProof;
    const traversalPass = String(runtime.flows?.adminRouteTraversal?.status || '').toUpperCase() === 'PASS';
    push(checks, 'Runtime protected/admin route traversal', traversalPass, runtime.flows?.adminRouteTraversal?.detail || 'admin route traversal evidence unavailable');
  }

  const failed = checks.filter((c) => c.status === 'FAIL');
  const result = {
    generatedAt: new Date().toISOString(),
    overallStatus: failed.length === 0 ? 'PASS' : 'FAIL',
    summary: { total: checks.length, pass: checks.length - failed.length, fail: failed.length },
    checks,
  };

  const md = [
    '# Protected Route Integrity',
    '',
    `Overall status: ${result.overallStatus}`,
    '',
    '## Checks',
    ...checks.map((c) => `- ${c.status} - ${c.name}: ${c.detail}`),
    '',
  ].join('\n');

  fs.mkdirSync(path.join(ROOT, 'proof'), { recursive: true });
  fs.writeFileSync(outJson, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  fs.writeFileSync(outMd, `${md}\n`, 'utf8');

  const output = { overallStatus: result.overallStatus, step: 'verify:protected-routes', proof: 'proof/protected-route-integrity.json' };
  if (result.overallStatus !== 'PASS') {
    console.error(JSON.stringify(output, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify(output, null, 2));
}

main();
