import {
  apiPath,
  fileExists,
  finalizeSection,
  makeCheck,
  parseExpressRouterFile,
  VerificationSection,
  webPath,
} from './platformVerification';

const CATEGORY = 'Investor';

export function verifyInvestor(): VerificationSection {
  const checks = [];
  const routeChecks = [];
  const routesPath = apiPath('routes', 'investorRoutes.ts');

  for (const requiredPath of [
    routesPath,
    apiPath('controllers', 'investorController.ts'),
    apiPath('models', 'SavedAnalysis.ts'),
    apiPath('models', 'Watchlist.ts'),
    apiPath('services', 'portfolio', 'buildInvestorDashboardSummary.ts'),
    webPath('pages', 'InvestorDashboard.tsx'),
    webPath('pages', 'SavedAnalyses.tsx'),
    webPath('pages', 'Watchlist.tsx'),
  ]) {
    checks.push(
      makeCheck(
        CATEGORY,
        `${requiredPath.split(/[/\\]/).slice(-1)[0]} exists`,
        fileExists(requiredPath) ? 'PASS' : 'FAIL',
        fileExists(requiredPath) ? 'Required investor surface file is present.' : 'Required investor surface file is missing.',
      ),
    );
  }

  if (fileExists(routesPath)) {
    routeChecks.push(...parseExpressRouterFile(CATEGORY, routesPath, '/investor'));
    for (const expectedRoute of ['/investor/dashboard', '/investor/saved-analyses', '/investor/watchlist']) {
      const found = routeChecks.some((routeCheck) => routeCheck.path === expectedRoute);
      checks.push(
        makeCheck(
          CATEGORY,
          `Investor route ${expectedRoute}`,
          found ? 'PASS' : 'FAIL',
          found ? 'Expected investor route is declared.' : 'Expected investor route declaration is missing.',
        ),
      );
    }

    checks.push(
      makeCheck(
        CATEGORY,
        'Investor routes require auth middleware',
        routeChecks.every((routeCheck) => routeCheck.requiresAuth) ? 'PASS' : 'FAIL',
        routeChecks.every((routeCheck) => routeCheck.requiresAuth) ? 'All investor routes are structurally gated by auth middleware.' : 'One or more investor routes are missing auth middleware.',
      ),
    );
  }

  return finalizeSection({ category: CATEGORY, checks, routeChecks });
}
