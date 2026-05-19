"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAdmin = verifyAdmin;
const platformVerification_1 = require("./platformVerification");
const CATEGORY = 'Admin';
function verifyAdmin() {
    const checks = [];
    const routeChecks = [];
    const riskRegister = [];
    const missingExternalConfigs = [];
    const routesPath = (0, platformVerification_1.apiPath)('routes', 'adminRoutes.ts');
    const controllerPath = (0, platformVerification_1.apiPath)('controllers', 'adminController.ts');
    const adminMiddlewarePath = (0, platformVerification_1.apiPath)('middleware', 'admin.ts');
    checks.push((0, platformVerification_1.makeCheck)(CATEGORY, 'adminRoutes file exists', (0, platformVerification_1.fileExists)(routesPath) ? 'PASS' : 'FAIL', 'Admin route file presence verified.'), (0, platformVerification_1.makeCheck)(CATEGORY, 'adminController file exists', (0, platformVerification_1.fileExists)(controllerPath) ? 'PASS' : 'FAIL', 'Admin controller file presence verified.'), (0, platformVerification_1.makeCheck)(CATEGORY, 'admin middleware file exists', (0, platformVerification_1.fileExists)(adminMiddlewarePath) ? 'PASS' : 'FAIL', 'Admin middleware file presence verified.'));
    if ((0, platformVerification_1.fileExists)(routesPath)) {
        routeChecks.push(...(0, platformVerification_1.parseExpressRouterFile)(CATEGORY, routesPath, '/admin'));
        for (const expectedRoute of ['/admin/properties', '/admin/users', '/admin/analyses', '/admin/credit-ledger', '/admin/stripe-sessions', '/admin/runtime', '/admin/deployment']) {
            const found = routeChecks.some((routeCheck) => routeCheck.path === expectedRoute);
            checks.push((0, platformVerification_1.makeCheck)(CATEGORY, `Admin route ${expectedRoute}`, found ? 'PASS' : 'FAIL', found ? 'Expected admin route is declared.' : 'Expected admin route declaration is missing.'));
        }
        const insecureRoutes = routeChecks.filter((routeCheck) => !routeCheck.requiresAuth || !routeCheck.requiresAdmin);
        checks.push((0, platformVerification_1.makeCheck)(CATEGORY, 'Admin routes require auth and admin middleware', insecureRoutes.length === 0 ? 'PASS' : 'FAIL', insecureRoutes.length === 0 ? 'All admin routes are structurally gated by auth and admin middleware.' : 'One or more admin routes are missing auth/admin middleware.'));
    }
    if ((0, platformVerification_1.fileExists)(adminMiddlewarePath)) {
        const middlewareContent = (0, platformVerification_1.readText)(adminMiddlewarePath);
        checks.push((0, platformVerification_1.makeCheck)(CATEGORY, 'Admin middleware enforces ADMIN role', middlewareContent.includes("req.user.role !== 'ADMIN'") ? 'PASS' : 'WARN', middlewareContent.includes("req.user.role !== 'ADMIN'") ? 'Admin middleware explicitly checks for the ADMIN role.' : 'Admin middleware does not clearly show an explicit ADMIN role check.'));
    }
    const adminEmail = process.env.ADMIN_EMAIL || '';
    checks.push((0, platformVerification_1.makeCheck)(CATEGORY, 'ADMIN_EMAIL readiness', adminEmail ? 'PASS' : 'WARN', adminEmail ? 'ADMIN_EMAIL is present.' : 'ADMIN_EMAIL is missing; promotion and admin-targeted flows may be harder to verify.', (0, platformVerification_1.envMaskDetail)(['ADMIN_EMAIL'])));
    if (!adminEmail) {
        missingExternalConfigs.push((0, platformVerification_1.makeMissingExternalConfig)(CATEGORY, 'ADMIN_EMAIL', 'Admin mailbox is not configured.', 'WARN'));
        riskRegister.push((0, platformVerification_1.makeRisk)(CATEGORY, 'medium', 'Admin email missing', 'Admin bootstrap and promotion flows rely on a known admin email target.'));
    }
    return (0, platformVerification_1.finalizeSection)({ category: CATEGORY, checks, routeChecks, riskRegister, missingExternalConfigs });
}
