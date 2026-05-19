"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyInvestor = verifyInvestor;
const platformVerification_1 = require("./platformVerification");
const CATEGORY = 'Investor';
function verifyInvestor() {
    const checks = [];
    const routeChecks = [];
    const routesPath = (0, platformVerification_1.apiPath)('routes', 'investorRoutes.ts');
    for (const requiredPath of [
        routesPath,
        (0, platformVerification_1.apiPath)('controllers', 'investorController.ts'),
        (0, platformVerification_1.apiPath)('models', 'SavedAnalysis.ts'),
        (0, platformVerification_1.apiPath)('models', 'Watchlist.ts'),
        (0, platformVerification_1.apiPath)('services', 'portfolio', 'buildInvestorDashboardSummary.ts'),
        (0, platformVerification_1.webPath)('pages', 'InvestorDashboard.tsx'),
        (0, platformVerification_1.webPath)('pages', 'SavedAnalyses.tsx'),
        (0, platformVerification_1.webPath)('pages', 'Watchlist.tsx'),
    ]) {
        checks.push((0, platformVerification_1.makeCheck)(CATEGORY, `${requiredPath.split(/[/\\]/).slice(-1)[0]} exists`, (0, platformVerification_1.fileExists)(requiredPath) ? 'PASS' : 'FAIL', (0, platformVerification_1.fileExists)(requiredPath) ? 'Required investor surface file is present.' : 'Required investor surface file is missing.'));
    }
    if ((0, platformVerification_1.fileExists)(routesPath)) {
        routeChecks.push(...(0, platformVerification_1.parseExpressRouterFile)(CATEGORY, routesPath, '/investor'));
        for (const expectedRoute of ['/investor/dashboard', '/investor/saved-analyses', '/investor/watchlist']) {
            const found = routeChecks.some((routeCheck) => routeCheck.path === expectedRoute);
            checks.push((0, platformVerification_1.makeCheck)(CATEGORY, `Investor route ${expectedRoute}`, found ? 'PASS' : 'FAIL', found ? 'Expected investor route is declared.' : 'Expected investor route declaration is missing.'));
        }
        checks.push((0, platformVerification_1.makeCheck)(CATEGORY, 'Investor routes require auth middleware', routeChecks.every((routeCheck) => routeCheck.requiresAuth) ? 'PASS' : 'FAIL', routeChecks.every((routeCheck) => routeCheck.requiresAuth) ? 'All investor routes are structurally gated by auth middleware.' : 'One or more investor routes are missing auth middleware.'));
    }
    return (0, platformVerification_1.finalizeSection)({ category: CATEGORY, checks, routeChecks });
}
