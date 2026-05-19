import { apiPath, fileExists, parseExpressRouterFile } from './platformVerification';
import type { RbacCheck } from './verifyAdminAccess';

const USER_ROUTE_FILES = [
  { file: apiPath('routes', 'propertyRoutes.ts'), mount: '/properties' },
  { file: apiPath('routes', 'analysisRoutes.ts'), mount: '/analysis' },
  { file: apiPath('routes', 'reportRoutes.ts'), mount: '/reports' },
  { file: apiPath('routes', 'documentRoutes.ts'), mount: '/properties' },
  { file: apiPath('routes', 'portfolioRoutes.ts'), mount: '/investor' },
  { file: apiPath('routes', 'investorRoutes.ts'), mount: '/investor' },
  { file: apiPath('routes', 'notificationRoutes.ts'), mount: '/' },
  { file: apiPath('routes', 'workspaceRoutes.ts'), mount: '/' },
  { file: apiPath('routes', 'exportRoutes.ts'), mount: '/exports' },
];

export function verifyRouteScoping(): RbacCheck[] {
  const checks: RbacCheck[] = [];

  for (const entry of USER_ROUTE_FILES) {
    const exists = fileExists(entry.file);
    const label = entry.file.split(/[\\/]/).pop() || entry.file;
    checks.push({
      id: `route_file_${label}`,
      status: exists ? 'PASS' : 'FAIL',
      message: exists ? `${label} exists` : `${label} missing`,
    });

    if (!exists) continue;

    const routes = parseExpressRouterFile('RBAC', entry.file, entry.mount);
    const unguarded = routes.filter((r) => !r.requiresAuth && !r.path.startsWith('/health'));

    checks.push({
      id: `route_auth_${label}`,
      status: unguarded.length === 0 ? 'PASS' : 'FAIL',
      message:
        unguarded.length === 0
          ? `${label} routes are auth-guarded`
          : `${label} has unguarded routes: ${unguarded.map((r) => r.path).join(', ')}`,
    });
  }

  return checks;
}
