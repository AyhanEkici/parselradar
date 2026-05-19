"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRoutes = verifyRoutes;
const platformVerification_1 = require("./platformVerification");
const CATEGORY = 'Routes';
const ROUTE_MOUNTS = [
    { symbol: 'authRoutes', file: (0, platformVerification_1.apiPath)('routes', 'authRoutes.ts'), mountPath: '/auth' },
    { symbol: 'creditRoutes', file: (0, platformVerification_1.apiPath)('routes', 'creditRoutes.ts'), mountPath: '/credits' },
    { symbol: 'stripeRoutes', file: (0, platformVerification_1.apiPath)('routes', 'stripeRoutes.ts'), mountPath: '/stripe' },
    { symbol: 'propertyRoutes', file: (0, platformVerification_1.apiPath)('routes', 'propertyRoutes.ts'), mountPath: '/properties' },
    { symbol: 'documentRoutes', file: (0, platformVerification_1.apiPath)('routes', 'documentRoutes.ts'), mountPath: '/properties' },
    { symbol: 'consentRoutes', file: (0, platformVerification_1.apiPath)('routes', 'consentRoutes.ts'), mountPath: '/properties' },
    { symbol: 'analysisRoutes', file: (0, platformVerification_1.apiPath)('routes', 'analysisRoutes.ts'), mountPath: '/analysis' },
    { symbol: 'reportRoutes', file: (0, platformVerification_1.apiPath)('routes', 'reportRoutes.ts'), mountPath: '/reports' },
    { symbol: 'investorRoutes', file: (0, platformVerification_1.apiPath)('routes', 'investorRoutes.ts'), mountPath: '/investor' },
    { symbol: 'portfolioRoutes', file: (0, platformVerification_1.apiPath)('routes', 'portfolioRoutes.ts'), mountPath: '/investor' },
    { symbol: 'portfolioAnalyticsRoutes', file: (0, platformVerification_1.apiPath)('routes', 'portfolioAnalyticsRoutes.ts'), mountPath: '/investor' },
    { symbol: 'exportRoutes', file: (0, platformVerification_1.apiPath)('routes', 'exportRoutes.ts'), mountPath: '/exports' },
    { symbol: 'organizationRoutes', file: (0, platformVerification_1.apiPath)('routes', 'organizationRoutes.ts'), mountPath: '/' },
    { symbol: 'workspaceRoutes', file: (0, platformVerification_1.apiPath)('routes', 'workspaceRoutes.ts'), mountPath: '/' },
    { symbol: 'sharedAnalysisRoutes', file: (0, platformVerification_1.apiPath)('routes', 'sharedAnalysisRoutes.ts'), mountPath: '/' },
    { symbol: 'notificationRoutes', file: (0, platformVerification_1.apiPath)('routes', 'notificationRoutes.ts'), mountPath: '/' },
    { symbol: 'observabilityRoutes', file: (0, platformVerification_1.apiPath)('routes', 'observabilityRoutes.ts'), mountPath: '/' },
    { symbol: 'connectorActivationRoutes', file: (0, platformVerification_1.apiPath)('routes', 'connectorActivationRoutes.ts'), mountPath: '/' },
    { symbol: 'adminRoutes', file: (0, platformVerification_1.apiPath)('routes', 'adminRoutes.ts'), mountPath: '/admin' },
    { symbol: 'auditRoutes', file: (0, platformVerification_1.apiPath)('routes', 'auditRoutes.ts'), mountPath: '/' },
];
const FRONTEND_PAGES = [
    'Login.tsx',
    'Register.tsx',
    'Dashboard.tsx',
    'InvestorDashboard.tsx',
    'PortfolioDashboard.tsx',
    'PortfolioAnalytics.tsx',
    'WorkspaceDashboard.tsx',
    'WorkspaceActivity.tsx',
    'NotificationInbox.tsx',
    'NotificationPreferences.tsx',
    'AdminObservability.tsx',
    'AdminAuditTimeline.tsx',
    'AdminConnectors.tsx',
    'AdminConnectorDetail.tsx',
];
function verifyRoutes() {
    const checks = [];
    const riskRegister = [];
    const indexPath = (0, platformVerification_1.apiPath)('index.ts');
    const indexExists = (0, platformVerification_1.fileExists)(indexPath);
    const indexContent = indexExists ? (0, platformVerification_1.readText)(indexPath) : '';
    const mounts = indexContent ? (0, platformVerification_1.parseIndexMounts)(indexContent) : [];
    const healthRoutes = indexExists ? (0, platformVerification_1.parseAppRoutes)(CATEGORY, indexPath) : [];
    checks.push((0, platformVerification_1.makeCheck)(CATEGORY, 'API index file exists', (0, platformVerification_1.fileExists)(indexPath) ? 'PASS' : 'FAIL', 'apps/api/src/index.ts presence verified.'));
    if (indexExists) {
        const hasBuildInfoRoute = indexContent.includes("app.get('/__buildinfo'") && indexContent.includes('res.json(');
        checks.push((0, platformVerification_1.makeCheck)(CATEGORY, 'Diagnostic route GET /__buildinfo', hasBuildInfoRoute ? 'PASS' : 'FAIL', hasBuildInfoRoute
            ? 'apps/api/src/index.ts declares GET /__buildinfo and responds with JSON.'
            : 'apps/api/src/index.ts is missing the GET /__buildinfo diagnostic JSON route.'));
    }
    const adminApiChecks = [
        { method: 'GET', path: '/admin/observability' },
        { method: 'GET', path: '/admin/analytics' },
        { method: 'GET', path: '/admin/telemetry' },
        { method: 'GET', path: '/admin/connectors' },
        { method: 'GET', path: '/admin/connectors/:connectorKey' },
        { method: 'GET', path: '/admin/deployment' },
        { method: 'GET', path: '/admin/runtime' },
    ];
    const adminRouteChecks = [
        ...(0, platformVerification_1.parseExpressRouterFile)(CATEGORY, (0, platformVerification_1.apiPath)('routes', 'adminRoutes.ts'), '/admin'),
        ...(0, platformVerification_1.parseExpressRouterFile)(CATEGORY, (0, platformVerification_1.apiPath)('routes', 'observabilityRoutes.ts'), '/'),
        ...(0, platformVerification_1.parseExpressRouterFile)(CATEGORY, (0, platformVerification_1.apiPath)('routes', 'connectorActivationRoutes.ts'), '/'),
    ];
    for (const expected of adminApiChecks) {
        const found = adminRouteChecks.find((routeCheck) => routeCheck.method === expected.method && routeCheck.path === expected.path);
        checks.push((0, platformVerification_1.makeCheck)(CATEGORY, `Admin API route ${expected.method} ${expected.path}`, found ? 'PASS' : 'FAIL', found ? 'Expected admin API route is declared in router files.' : 'Expected admin API route is missing from router declarations.'));
        if (found) {
            checks.push((0, platformVerification_1.makeCheck)(CATEGORY, `Admin API gating ${expected.method} ${expected.path}`, found.requiresAuth && found.requiresAdmin ? 'PASS' : 'FAIL', found.requiresAuth && found.requiresAdmin
                ? 'Admin API route is structurally gated by auth + admin middleware.'
                : 'Admin API route is missing auth/admin middleware in route declaration.'));
        }
    }
    for (const routeMount of ROUTE_MOUNTS) {
        const routeFileExists = (0, platformVerification_1.fileExists)(routeMount.file);
        checks.push((0, platformVerification_1.makeCheck)(CATEGORY, `${routeMount.symbol} file exists`, routeFileExists ? 'PASS' : 'FAIL', routeFileExists ? 'Mounted route file is present.' : 'Mounted route file is missing.'));
        if (routeFileExists) {
            const routeContent = (0, platformVerification_1.readText)(routeMount.file);
            checks.push((0, platformVerification_1.makeCheck)(CATEGORY, `${routeMount.symbol} default export`, routeContent.includes('export default router') ? 'PASS' : 'FAIL', routeContent.includes('export default router') ? 'Route file exports default router.' : 'Route file does not export default router.'));
        }
        checks.push((0, platformVerification_1.makeCheck)(CATEGORY, `${routeMount.symbol} mounted at ${routeMount.mountPath}`, mounts.some((mount) => mount.symbol === routeMount.symbol && mount.mountPath === routeMount.mountPath) ? 'PASS' : 'FAIL', mounts.some((mount) => mount.symbol === routeMount.symbol && mount.mountPath === routeMount.mountPath)
            ? 'Route mount found in index.ts.'
            : 'Expected route mount not found in index.ts.'));
    }
    for (const expectedHealthRoute of ['/health', '/health/live', '/health/ready']) {
        checks.push((0, platformVerification_1.makeCheck)(CATEGORY, `Health route ${expectedHealthRoute}`, healthRoutes.some((routeCheck) => routeCheck.path === expectedHealthRoute) ? 'PASS' : 'FAIL', healthRoutes.some((routeCheck) => routeCheck.path === expectedHealthRoute)
            ? 'Health route is registered in index.ts.'
            : 'Health route is missing from index.ts.'));
    }
    for (const page of FRONTEND_PAGES) {
        const pagePath = (0, platformVerification_1.webPath)('pages', page);
        checks.push((0, platformVerification_1.makeCheck)(CATEGORY, `Frontend page ${page}`, (0, platformVerification_1.fileExists)(pagePath) ? 'PASS' : 'FAIL', (0, platformVerification_1.fileExists)(pagePath) ? 'Expected frontend page file is present.' : 'Expected frontend page file is missing.'));
    }
    if (!mounts.some((mount) => mount.symbol === 'notificationRoutes') || !mounts.some((mount) => mount.symbol === 'connectorActivationRoutes')) {
        riskRegister.push((0, platformVerification_1.makeRisk)(CATEGORY, 'medium', 'Index route registration drift', 'One or more expected root-mounted routes are missing from index.ts. Some major platform surfaces may exist on disk but be unreachable at runtime.'));
    }
    return (0, platformVerification_1.finalizeSection)({ category: CATEGORY, checks, routeChecks: healthRoutes, riskRegister });
}
