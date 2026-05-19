import { apiPath, fileExists, makeCheck, parseExpressRouterFile } from './platformVerification';

export type RbacCheck = {
  id: string;
  status: 'PASS' | 'FAIL';
  message: string;
};

const ADMIN_ROUTES = [
  { file: apiPath('routes', 'adminRoutes.ts'), mount: '/admin', path: '/admin/properties' },
  { file: apiPath('routes', 'observabilityRoutes.ts'), mount: '/', path: '/admin/observability' },
  { file: apiPath('routes', 'observabilityRoutes.ts'), mount: '/', path: '/admin/analytics' },
  { file: apiPath('routes', 'connectorActivationRoutes.ts'), mount: '/', path: '/admin/connectors' },
];

export function verifyAdminAccess(): RbacCheck[] {
  const checks: RbacCheck[] = [];

  for (const entry of ADMIN_ROUTES) {
    const exists = fileExists(entry.file);
    checks.push({
      id: `admin_file_${entry.path}`,
      status: exists ? 'PASS' : 'FAIL',
      message: exists ? `Route file exists for ${entry.path}` : `Missing route file for ${entry.path}`,
    });

    if (!exists) continue;

    const routes = parseExpressRouterFile('RBAC', entry.file, entry.mount);
    const route = routes.find((r) => r.path === entry.path);
    checks.push({
      id: `admin_declared_${entry.path}`,
      status: route ? 'PASS' : 'FAIL',
      message: route ? `${entry.path} is declared` : `${entry.path} is not declared`,
    });

    checks.push({
      id: `admin_guarded_${entry.path}`,
      status: route && route.requiresAuth && route.requiresAdmin ? 'PASS' : 'FAIL',
      message:
        route && route.requiresAuth && route.requiresAdmin
          ? `${entry.path} enforces auth+admin middleware`
          : `${entry.path} is missing strict auth+admin middleware`,
    });
  }

  return checks;
}
