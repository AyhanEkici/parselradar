"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPortfolio = verifyPortfolio;
const platformVerification_1 = require("./platformVerification");
const CATEGORY = 'Portfolio';
function verifyPortfolio() {
    const checks = [];
    const routeChecks = [];
    const routeFiles = [(0, platformVerification_1.apiPath)('routes', 'portfolioRoutes.ts'), (0, platformVerification_1.apiPath)('routes', 'portfolioAnalyticsRoutes.ts')];
    for (const requiredPath of [
        ...routeFiles,
        (0, platformVerification_1.apiPath)('controllers', 'portfolioController.ts'),
        (0, platformVerification_1.apiPath)('controllers', 'portfolioAnalyticsController.ts'),
        (0, platformVerification_1.apiPath)('models', 'Portfolio.ts'),
        (0, platformVerification_1.apiPath)('models', 'PortfolioItem.ts'),
        (0, platformVerification_1.apiPath)('services', 'portfolio', 'createPortfolioSnapshot.ts'),
        (0, platformVerification_1.apiPath)('services', 'portfolioAnalytics', 'calculatePortfolioBenchmark.ts'),
        (0, platformVerification_1.webPath)('pages', 'PortfolioDashboard.tsx'),
        (0, platformVerification_1.webPath)('pages', 'PortfolioDetail.tsx'),
        (0, platformVerification_1.webPath)('pages', 'PortfolioAnalytics.tsx'),
    ]) {
        checks.push((0, platformVerification_1.makeCheck)(CATEGORY, `${requiredPath.split(/[/\\]/).slice(-1)[0]} exists`, (0, platformVerification_1.fileExists)(requiredPath) ? 'PASS' : 'FAIL', (0, platformVerification_1.fileExists)(requiredPath) ? 'Required portfolio surface file is present.' : 'Required portfolio surface file is missing.'));
    }
    for (const routeFile of routeFiles) {
        if ((0, platformVerification_1.fileExists)(routeFile)) {
            routeChecks.push(...(0, platformVerification_1.parseExpressRouterFile)(CATEGORY, routeFile, '/investor'));
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
        checks.push((0, platformVerification_1.makeCheck)(CATEGORY, `Portfolio route ${expectedRoute}`, routeChecks.some((routeCheck) => routeCheck.path === expectedRoute) ? 'PASS' : 'FAIL', routeChecks.some((routeCheck) => routeCheck.path === expectedRoute)
            ? 'Expected portfolio route is declared.'
            : 'Expected portfolio route declaration is missing.'));
    }
    checks.push((0, platformVerification_1.makeCheck)(CATEGORY, 'Portfolio routes require auth middleware', routeChecks.every((routeCheck) => routeCheck.requiresAuth) ? 'PASS' : 'FAIL', routeChecks.every((routeCheck) => routeCheck.requiresAuth)
        ? 'All portfolio routes are structurally gated by auth middleware.'
        : 'One or more portfolio routes are missing auth middleware.'));
    return (0, platformVerification_1.finalizeSection)({ category: CATEGORY, checks, routeChecks });
}
