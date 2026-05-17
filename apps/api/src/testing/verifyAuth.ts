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

const CATEGORY = 'Auth';

export function verifyAuth(): VerificationSection {
  const checks = [];
  const riskRegister = [];
  const missingExternalConfigs = [];
  const routeChecks = [];
  const authRoutesPath = apiPath('routes', 'authRoutes.ts');
  const authControllerPath = apiPath('controllers', 'authController.ts');
  const authMiddlewarePath = apiPath('middleware', 'auth.ts');

  checks.push(
    makeCheck(CATEGORY, 'authRoutes file exists', fileExists(authRoutesPath) ? 'PASS' : 'FAIL', 'Auth route file presence verified.'),
    makeCheck(CATEGORY, 'authController file exists', fileExists(authControllerPath) ? 'PASS' : 'FAIL', 'Auth controller file presence verified.'),
    makeCheck(CATEGORY, 'auth middleware file exists', fileExists(authMiddlewarePath) ? 'PASS' : 'FAIL', 'Auth middleware file presence verified.'),
  );

  if (fileExists(authRoutesPath)) {
    const routeFileContent = readText(authRoutesPath);
    routeChecks.push(...parseExpressRouterFile(CATEGORY, authRoutesPath, '/auth'));

    for (const expectedRoute of [
      { method: 'POST', path: '/auth/register' },
      { method: 'POST', path: '/auth/login' },
      { method: 'POST', path: '/auth/logout' },
      { method: 'GET', path: '/auth/me' },
    ]) {
      const found = routeChecks.some((routeCheck) => routeCheck.method === expectedRoute.method && routeCheck.path === expectedRoute.path);
      checks.push(
        makeCheck(
          CATEGORY,
          `Route ${expectedRoute.method} ${expectedRoute.path}`,
          found ? 'PASS' : 'FAIL',
          found ? 'Expected auth route is declared.' : 'Expected auth route declaration is missing.',
        ),
      );
    }

    checks.push(
      makeCheck(
        CATEGORY,
        'Auth limiter on register/login/logout',
        routeFileContent.includes('authLimiter, register') && routeFileContent.includes('authLimiter, login') && routeFileContent.includes('authLimiter, logout') ? 'PASS' : 'WARN',
        routeFileContent.includes('authLimiter, register') && routeFileContent.includes('authLimiter, login') && routeFileContent.includes('authLimiter, logout')
          ? 'Register, login, and logout routes are rate limited.'
          : 'One or more auth routes may be missing authLimiter middleware.',
      ),
    );
  }

  if (fileExists(authMiddlewarePath)) {
    const middlewareContent = readText(authMiddlewarePath);
    checks.push(
      makeCheck(
        CATEGORY,
        'Auth middleware validates JWT and user lookup',
        middlewareContent.includes('jwt.verify') && middlewareContent.includes('User.findById') ? 'PASS' : 'WARN',
        middlewareContent.includes('jwt.verify') && middlewareContent.includes('User.findById')
          ? 'Auth middleware verifies JWT and resolves the user record.'
          : 'Auth middleware structure does not clearly prove JWT verification and user lookup.',
      ),
    );
  }

  const jwtSecret = process.env.JWT_SECRET || '';
  const clientUrl = process.env.CLIENT_URL || '';
  checks.push(
    makeCheck(
      CATEGORY,
      'JWT_SECRET readiness',
      jwtSecret.length >= 32 ? 'PASS' : 'WARN',
      jwtSecret.length >= 32 ? 'JWT secret is present with acceptable length.' : 'JWT secret is missing or shorter than the expected minimum length.',
      jwtSecret ? `JWT_SECRET=PRESENT, length=${jwtSecret.length}` : 'JWT_SECRET=MISSING',
    ),
    makeCheck(
      CATEGORY,
      'CLIENT_URL readiness',
      clientUrl ? 'PASS' : 'WARN',
      clientUrl ? 'CLIENT_URL is present.' : 'CLIENT_URL is missing; browser CORS flows may fail.',
      envMaskDetail(['CLIENT_URL']),
    ),
  );

  if (!jwtSecret) {
    missingExternalConfigs.push(makeMissingExternalConfig(CATEGORY, 'JWT_SECRET', 'Authentication signing secret is missing.', 'WARN'));
    riskRegister.push(makeRisk(CATEGORY, 'high', 'JWT secret missing', 'Auth login and request verification cannot be trusted without JWT_SECRET.'));
  }
  if (!clientUrl) {
    missingExternalConfigs.push(makeMissingExternalConfig(CATEGORY, 'CLIENT_URL', 'Browser client origin is missing.', 'WARN'));
  }

  return finalizeSection({ category: CATEGORY, checks, routeChecks, riskRegister, missingExternalConfigs });
}
