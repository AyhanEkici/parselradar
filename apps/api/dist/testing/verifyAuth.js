"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAuth = verifyAuth;
const platformVerification_1 = require("./platformVerification");
const CATEGORY = 'Auth';
function verifyAuth() {
    const checks = [];
    const riskRegister = [];
    const missingExternalConfigs = [];
    const routeChecks = [];
    const authRoutesPath = (0, platformVerification_1.apiPath)('routes', 'authRoutes.ts');
    const authControllerPath = (0, platformVerification_1.apiPath)('controllers', 'authController.ts');
    const authMiddlewarePath = (0, platformVerification_1.apiPath)('middleware', 'auth.ts');
    checks.push((0, platformVerification_1.makeCheck)(CATEGORY, 'authRoutes file exists', (0, platformVerification_1.fileExists)(authRoutesPath) ? 'PASS' : 'FAIL', 'Auth route file presence verified.'), (0, platformVerification_1.makeCheck)(CATEGORY, 'authController file exists', (0, platformVerification_1.fileExists)(authControllerPath) ? 'PASS' : 'FAIL', 'Auth controller file presence verified.'), (0, platformVerification_1.makeCheck)(CATEGORY, 'auth middleware file exists', (0, platformVerification_1.fileExists)(authMiddlewarePath) ? 'PASS' : 'FAIL', 'Auth middleware file presence verified.'));
    if ((0, platformVerification_1.fileExists)(authRoutesPath)) {
        const routeFileContent = (0, platformVerification_1.readText)(authRoutesPath);
        routeChecks.push(...(0, platformVerification_1.parseExpressRouterFile)(CATEGORY, authRoutesPath, '/auth'));
        for (const expectedRoute of [
            { method: 'POST', path: '/auth/register' },
            { method: 'POST', path: '/auth/login' },
            { method: 'POST', path: '/auth/logout' },
            { method: 'GET', path: '/auth/me' },
        ]) {
            const found = routeChecks.some((routeCheck) => routeCheck.method === expectedRoute.method && routeCheck.path === expectedRoute.path);
            checks.push((0, platformVerification_1.makeCheck)(CATEGORY, `Route ${expectedRoute.method} ${expectedRoute.path}`, found ? 'PASS' : 'FAIL', found ? 'Expected auth route is declared.' : 'Expected auth route declaration is missing.'));
        }
        checks.push((0, platformVerification_1.makeCheck)(CATEGORY, 'Auth limiter on register/login/logout', routeFileContent.includes('authLimiter, register') && routeFileContent.includes('authLimiter, login') && routeFileContent.includes('authLimiter, logout') ? 'PASS' : 'WARN', routeFileContent.includes('authLimiter, register') && routeFileContent.includes('authLimiter, login') && routeFileContent.includes('authLimiter, logout')
            ? 'Register, login, and logout routes are rate limited.'
            : 'One or more auth routes may be missing authLimiter middleware.'));
    }
    if ((0, platformVerification_1.fileExists)(authMiddlewarePath)) {
        const middlewareContent = (0, platformVerification_1.readText)(authMiddlewarePath);
        checks.push((0, platformVerification_1.makeCheck)(CATEGORY, 'Auth middleware validates JWT and user lookup', middlewareContent.includes('jwt.verify') && middlewareContent.includes('User.findById') ? 'PASS' : 'WARN', middlewareContent.includes('jwt.verify') && middlewareContent.includes('User.findById')
            ? 'Auth middleware verifies JWT and resolves the user record.'
            : 'Auth middleware structure does not clearly prove JWT verification and user lookup.'));
    }
    const jwtSecret = process.env.JWT_SECRET || '';
    const clientUrl = process.env.CLIENT_URL || '';
    checks.push((0, platformVerification_1.makeCheck)(CATEGORY, 'JWT_SECRET readiness', jwtSecret.length >= 32 ? 'PASS' : 'WARN', jwtSecret.length >= 32 ? 'JWT secret is present with acceptable length.' : 'JWT secret is missing or shorter than the expected minimum length.', jwtSecret ? `JWT_SECRET=PRESENT, length=${jwtSecret.length}` : 'JWT_SECRET=MISSING'), (0, platformVerification_1.makeCheck)(CATEGORY, 'CLIENT_URL readiness', clientUrl ? 'PASS' : 'WARN', clientUrl ? 'CLIENT_URL is present.' : 'CLIENT_URL is missing; browser CORS flows may fail.', (0, platformVerification_1.envMaskDetail)(['CLIENT_URL'])));
    if (!jwtSecret) {
        missingExternalConfigs.push((0, platformVerification_1.makeMissingExternalConfig)(CATEGORY, 'JWT_SECRET', 'Authentication signing secret is missing.', 'WARN'));
        riskRegister.push((0, platformVerification_1.makeRisk)(CATEGORY, 'high', 'JWT secret missing', 'Auth login and request verification cannot be trusted without JWT_SECRET.'));
    }
    if (!clientUrl) {
        missingExternalConfigs.push((0, platformVerification_1.makeMissingExternalConfig)(CATEGORY, 'CLIENT_URL', 'Browser client origin is missing.', 'WARN'));
    }
    return (0, platformVerification_1.finalizeSection)({ category: CATEGORY, checks, routeChecks, riskRegister, missingExternalConfigs });
}
