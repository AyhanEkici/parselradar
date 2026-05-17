import {
  apiPath,
  fileExists,
  finalizeSection,
  makeCheck,
  makeRisk,
  parseExpressRouterFile,
  VerificationSection,
  webPath,
} from './platformVerification';

const CATEGORY = 'Workspace';

export function verifyWorkspace(): VerificationSection {
  const checks = [];
  const routeChecks = [];
  const riskRegister = [];

  for (const requiredPath of [
    apiPath('routes', 'workspaceRoutes.ts'),
    apiPath('routes', 'organizationRoutes.ts'),
    apiPath('routes', 'sharedAnalysisRoutes.ts'),
    apiPath('controllers', 'workspaceController.ts'),
    apiPath('controllers', 'organizationController.ts'),
    apiPath('controllers', 'sharedAnalysisController.ts'),
    apiPath('models', 'Workspace.ts'),
    apiPath('models', 'WorkspaceActivity.ts'),
    apiPath('models', 'WorkspacePortfolio.ts'),
    apiPath('models', 'WorkspaceWatchlist.ts'),
    apiPath('models', 'Organization.ts'),
    apiPath('models', 'OrganizationMember.ts'),
    apiPath('services', 'workspace', 'buildWorkspaceActivityFeed.ts'),
    apiPath('services', 'workspace', 'buildSharedPortfolioSummary.ts'),
    webPath('pages', 'WorkspaceDashboard.tsx'),
    webPath('pages', 'WorkspaceActivity.tsx'),
    webPath('pages', 'WorkspacePortfolio.tsx'),
    webPath('pages', 'WorkspaceWatchlist.tsx'),
    webPath('pages', 'Organizations.tsx'),
    webPath('pages', 'OrganizationDetail.tsx'),
  ]) {
    checks.push(
      makeCheck(
        CATEGORY,
        `${requiredPath.split(/[/\\]/).slice(-1)[0]} exists`,
        fileExists(requiredPath) ? 'PASS' : 'FAIL',
        fileExists(requiredPath) ? 'Required workspace surface file is present.' : 'Required workspace surface file is missing.',
      ),
    );
  }

  for (const routeFile of [apiPath('routes', 'workspaceRoutes.ts'), apiPath('routes', 'organizationRoutes.ts'), apiPath('routes', 'sharedAnalysisRoutes.ts')]) {
    if (fileExists(routeFile)) {
      routeChecks.push(...parseExpressRouterFile(CATEGORY, routeFile, '/'));
    }
  }

  for (const expectedRoute of [
    '/workspace/:organizationId/dashboard',
    '/workspace/:organizationId/portfolios',
    '/workspace/:organizationId/watchlist',
    '/workspace/:organizationId/activity',
    '/organizations',
    '/workspace/:organizationId/shared-analysis',
  ]) {
    checks.push(
      makeCheck(
        CATEGORY,
        `Workspace route ${expectedRoute}`,
        routeChecks.some((routeCheck) => routeCheck.path === expectedRoute) ? 'PASS' : 'FAIL',
        routeChecks.some((routeCheck) => routeCheck.path === expectedRoute)
          ? 'Expected workspace route is declared.'
          : 'Expected workspace route declaration is missing.',
      ),
    );
  }

  checks.push(
    makeCheck(
      CATEGORY,
      'Workspace routes require auth middleware',
      routeChecks.every((routeCheck) => routeCheck.requiresAuth) ? 'PASS' : 'FAIL',
      routeChecks.every((routeCheck) => routeCheck.requiresAuth)
        ? 'All workspace and organization routes are structurally gated by auth middleware.'
        : 'One or more workspace or organization routes are missing auth middleware.',
    ),
  );

  riskRegister.push(
    makeRisk(
      CATEGORY,
      'low',
      'Workspace membership is inferred structurally',
      'The harness proves auth gating and file availability, but organization membership checks remain controller-level behavior that is not executed.',
    ),
  );

  return finalizeSection({ category: CATEGORY, checks, routeChecks, riskRegister });
}
