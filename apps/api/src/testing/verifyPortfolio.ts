import {
  apiPath,
  fileExists,
  finalizeSection,
  makeCheck,
  parseExpressRouterFile,
  VerificationSection,
  webPath,
} from './platformVerification';

const CATEGORY = 'Portfolio';

export function verifyPortfolio(): VerificationSection {
  const checks = [];
  const routeChecks = [];
  const routeFiles = [apiPath('routes', 'portfolioRoutes.ts'), apiPath('routes', 'portfolioAnalyticsRoutes.ts')];

  for (const requiredPath of [
    ...routeFiles,
    apiPath('controllers', 'portfolioController.ts'),
    apiPath('controllers', 'portfolioAnalyticsController.ts'),
    apiPath('models', 'Portfolio.ts'),
    apiPath('models', 'PortfolioItem.ts'),
    apiPath('services', 'portfolio', 'createPortfolioSnapshot.ts'),
    apiPath('services', 'portfolioAnalytics', 'calculatePortfolioBenchmark.ts'),
    webPath('pages', 'PortfolioDashboard.tsx'),
    webPath('pages', 'PortfolioDetail.tsx'),
    webPath('pages', 'PortfolioAnalytics.tsx'),
  ]) {
    checks.push(
      makeCheck(
        CATEGORY,
        `${requiredPath.split(/[/\\]/).slice(-1)[0]} exists`,
        fileExists(requiredPath) ? 'PASS' : 'FAIL',
        fileExists(requiredPath) ? 'Required portfolio surface file is present.' : 'Required portfolio surface file is missing.',
      ),
    );
  }

  for (const routeFile of routeFiles) {
    if (fileExists(routeFile)) {
      routeChecks.push(...parseExpressRouterFile(CATEGORY, routeFile, '/investor'));
    }
  }

  for (const expectedRoute of [
    '/investor/portfolio',
    '/investor/portfolio/:id',
    '/investor/portfolio/:id/analytics',
    '/investor/portfolio/:id/benchmark',
    '/investor/portfolio/:id/scenarios',
    '/investor/portfolio/:id/exposure',
    '/investor/portfolio/:id/performance',
  ]) {
    checks.push(
      makeCheck(
        CATEGORY,
        `Portfolio route ${expectedRoute}`,
        routeChecks.some((routeCheck) => routeCheck.path === expectedRoute) ? 'PASS' : 'FAIL',
        routeChecks.some((routeCheck) => routeCheck.path === expectedRoute)
          ? 'Expected portfolio route is declared.'
          : 'Expected portfolio route declaration is missing.',
      ),
    );
  }

  checks.push(
    makeCheck(
      CATEGORY,
      'Portfolio routes require auth middleware',
      routeChecks.every((routeCheck) => routeCheck.requiresAuth) ? 'PASS' : 'FAIL',
      routeChecks.every((routeCheck) => routeCheck.requiresAuth)
        ? 'All portfolio routes are structurally gated by auth middleware.'
        : 'One or more portfolio routes are missing auth middleware.',
    ),
  );

  return finalizeSection({ category: CATEGORY, checks, routeChecks });
}
