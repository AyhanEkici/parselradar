"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWorkspace = verifyWorkspace;
const platformVerification_1 = require("./platformVerification");
const CATEGORY = 'Workspace';
function verifyWorkspace() {
    const checks = [];
    const routeChecks = [];
    const riskRegister = [];
    for (const requiredPath of [
        (0, platformVerification_1.apiPath)('routes', 'workspaceRoutes.ts'),
        (0, platformVerification_1.apiPath)('routes', 'organizationRoutes.ts'),
        (0, platformVerification_1.apiPath)('routes', 'sharedAnalysisRoutes.ts'),
        (0, platformVerification_1.apiPath)('controllers', 'workspaceController.ts'),
        (0, platformVerification_1.apiPath)('controllers', 'organizationController.ts'),
        (0, platformVerification_1.apiPath)('controllers', 'sharedAnalysisController.ts'),
        (0, platformVerification_1.apiPath)('models', 'Workspace.ts'),
        (0, platformVerification_1.apiPath)('models', 'WorkspaceActivity.ts'),
        (0, platformVerification_1.apiPath)('models', 'WorkspacePortfolio.ts'),
        (0, platformVerification_1.apiPath)('models', 'WorkspaceWatchlist.ts'),
        (0, platformVerification_1.apiPath)('models', 'Organization.ts'),
        (0, platformVerification_1.apiPath)('models', 'OrganizationMember.ts'),
        (0, platformVerification_1.apiPath)('services', 'workspace', 'buildWorkspaceActivityFeed.ts'),
        (0, platformVerification_1.apiPath)('services', 'workspace', 'buildSharedPortfolioSummary.ts'),
        (0, platformVerification_1.webPath)('pages', 'WorkspaceDashboard.tsx'),
        (0, platformVerification_1.webPath)('pages', 'WorkspaceActivity.tsx'),
        (0, platformVerification_1.webPath)('pages', 'WorkspacePortfolio.tsx'),
        (0, platformVerification_1.webPath)('pages', 'WorkspaceWatchlist.tsx'),
        (0, platformVerification_1.webPath)('pages', 'Organizations.tsx'),
        (0, platformVerification_1.webPath)('pages', 'OrganizationDetail.tsx'),
    ]) {
        checks.push((0, platformVerification_1.makeCheck)(CATEGORY, `${requiredPath.split(/[/\\]/).slice(-1)[0]} exists`, (0, platformVerification_1.fileExists)(requiredPath) ? 'PASS' : 'FAIL', (0, platformVerification_1.fileExists)(requiredPath) ? 'Required workspace surface file is present.' : 'Required workspace surface file is missing.'));
    }
    for (const routeFile of [(0, platformVerification_1.apiPath)('routes', 'workspaceRoutes.ts'), (0, platformVerification_1.apiPath)('routes', 'organizationRoutes.ts'), (0, platformVerification_1.apiPath)('routes', 'sharedAnalysisRoutes.ts')]) {
        if ((0, platformVerification_1.fileExists)(routeFile)) {
            routeChecks.push(...(0, platformVerification_1.parseExpressRouterFile)(CATEGORY, routeFile, '/'));
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
        checks.push((0, platformVerification_1.makeCheck)(CATEGORY, `Workspace route ${expectedRoute}`, routeChecks.some((routeCheck) => routeCheck.path === expectedRoute) ? 'PASS' : 'FAIL', routeChecks.some((routeCheck) => routeCheck.path === expectedRoute)
            ? 'Expected workspace route is declared.'
            : 'Expected workspace route declaration is missing.'));
    }
    checks.push((0, platformVerification_1.makeCheck)(CATEGORY, 'Workspace routes require auth middleware', routeChecks.every((routeCheck) => routeCheck.requiresAuth) ? 'PASS' : 'FAIL', routeChecks.every((routeCheck) => routeCheck.requiresAuth)
        ? 'All workspace and organization routes are structurally gated by auth middleware.'
        : 'One or more workspace or organization routes are missing auth middleware.'));
    riskRegister.push((0, platformVerification_1.makeRisk)(CATEGORY, 'low', 'Workspace membership is inferred structurally', 'The harness proves auth gating and file availability, but organization membership checks remain controller-level behavior that is not executed.'));
    return (0, platformVerification_1.finalizeSection)({ category: CATEGORY, checks, routeChecks, riskRegister });
}
