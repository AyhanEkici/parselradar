import {
  apiPath,
  envMaskDetail,
  fileExists,
  finalizeSection,
  makeCheck,
  makeMissingExternalConfig,
  makeRisk,
  parseExpressRouterFile,
  readText,
  VerificationSection,
} from './platformVerification';

const CATEGORY = 'Admin';

export function verifyAdmin(): VerificationSection {
  const checks = [];
  const routeChecks = [];
  const riskRegister = [];
  const missingExternalConfigs = [];
  const routesPath = apiPath('routes', 'adminRoutes.ts');
  const controllerPath = apiPath('controllers', 'adminController.ts');
  const adminMiddlewarePath = apiPath('middleware', 'admin.ts');

  checks.push(
    makeCheck(CATEGORY, 'adminRoutes file exists', fileExists(routesPath) ? 'PASS' : 'FAIL', 'Admin route file presence verified.'),
    makeCheck(CATEGORY, 'adminController file exists', fileExists(controllerPath) ? 'PASS' : 'FAIL', 'Admin controller file presence verified.'),
    makeCheck(CATEGORY, 'admin middleware file exists', fileExists(adminMiddlewarePath) ? 'PASS' : 'FAIL', 'Admin middleware file presence verified.'),
  );

  if (fileExists(routesPath)) {
    routeChecks.push(...parseExpressRouterFile(CATEGORY, routesPath, '/admin'));
    for (const expectedRoute of ['/admin/properties', '/admin/users', '/admin/analyses', '/admin/credit-ledger', '/admin/stripe-sessions', '/admin/runtime', '/admin/deployment']) {
      const found = routeChecks.some((routeCheck) => routeCheck.path === expectedRoute);
      checks.push(
        makeCheck(
          CATEGORY,
          `Admin route ${expectedRoute}`,
          found ? 'PASS' : 'FAIL',
          found ? 'Expected admin route is declared.' : 'Expected admin route declaration is missing.',
        ),
      );
    }

    const insecureRoutes = routeChecks.filter((routeCheck) => !routeCheck.requiresAuth || !routeCheck.requiresAdmin);
    checks.push(
      makeCheck(
        CATEGORY,
        'Admin routes require auth and admin middleware',
        insecureRoutes.length === 0 ? 'PASS' : 'FAIL',
        insecureRoutes.length === 0 ? 'All admin routes are structurally gated by auth and admin middleware.' : 'One or more admin routes are missing auth/admin middleware.',
      ),
    );
  }

  if (fileExists(adminMiddlewarePath)) {
    const middlewareContent = readText(adminMiddlewarePath);
    checks.push(
      makeCheck(
        CATEGORY,
        'Admin middleware enforces ADMIN role',
        middlewareContent.includes("req.user.role !== 'ADMIN'") ? 'PASS' : 'WARN',
        middlewareContent.includes("req.user.role !== 'ADMIN'") ? 'Admin middleware explicitly checks for the ADMIN role.' : 'Admin middleware does not clearly show an explicit ADMIN role check.',
      ),
    );
  }

  const adminEmail = process.env.ADMIN_EMAIL || '';
  checks.push(
    makeCheck(
      CATEGORY,
      'ADMIN_EMAIL readiness',
      adminEmail ? 'PASS' : 'WARN',
      adminEmail ? 'ADMIN_EMAIL is present.' : 'ADMIN_EMAIL is missing; promotion and admin-targeted flows may be harder to verify.',
      envMaskDetail(['ADMIN_EMAIL']),
    ),
  );

  if (!adminEmail) {
    missingExternalConfigs.push(makeMissingExternalConfig(CATEGORY, 'ADMIN_EMAIL', 'Admin mailbox is not configured.', 'WARN'));
    riskRegister.push(makeRisk(CATEGORY, 'medium', 'Admin email missing', 'Admin bootstrap and promotion flows rely on a known admin email target.'));
  }

  return finalizeSection({ category: CATEGORY, checks, routeChecks, riskRegister, missingExternalConfigs });
}
