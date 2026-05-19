"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyObservability = verifyObservability;
const platformVerification_1 = require("./platformVerification");
const CATEGORY = 'Observability';
function verifyObservability() {
    const checks = [];
    const riskRegister = [];
    const routeChecks = [];
    const observabilityRoutePath = (0, platformVerification_1.apiPath)('routes', 'observabilityRoutes.ts');
    for (const requiredPath of [
        observabilityRoutePath,
        (0, platformVerification_1.apiPath)('controllers', 'observabilityController.ts'),
        (0, platformVerification_1.apiPath)('health', 'healthController.ts'),
        (0, platformVerification_1.apiPath)('health', 'livenessController.ts'),
        (0, platformVerification_1.apiPath)('health', 'readinessController.ts'),
        (0, platformVerification_1.apiPath)('monitoring', 'buildOperationalSnapshot.ts'),
        (0, platformVerification_1.apiPath)('observability', 'buildObservabilitySnapshot.ts'),
        (0, platformVerification_1.apiPath)('telemetry', 'telemetryProvider.ts'),
        (0, platformVerification_1.webPath)('pages', 'AdminObservability.tsx'),
        (0, platformVerification_1.webPath)('pages', 'AdminAnalytics.tsx'),
        (0, platformVerification_1.webPath)('pages', 'AdminSystemRuntime.tsx'),
        (0, platformVerification_1.webPath)('pages', 'AdminDeploymentOverview.tsx'),
        (0, platformVerification_1.webPath)('pages', 'AdminAuditTimeline.tsx'),
    ]) {
        checks.push((0, platformVerification_1.makeCheck)(CATEGORY, `${requiredPath.split(/[/\\]/).slice(-1)[0]} exists`, (0, platformVerification_1.fileExists)(requiredPath) ? 'PASS' : 'FAIL', (0, platformVerification_1.fileExists)(requiredPath) ? 'Required observability file is present.' : 'Required observability file is missing.'));
    }
    if ((0, platformVerification_1.fileExists)(observabilityRoutePath)) {
        routeChecks.push(...(0, platformVerification_1.parseExpressRouterFile)(CATEGORY, observabilityRoutePath, '/'));
        for (const expectedRoute of ['/admin/observability', '/admin/analytics', '/admin/telemetry']) {
            checks.push((0, platformVerification_1.makeCheck)(CATEGORY, `Observability route ${expectedRoute}`, routeChecks.some((routeCheck) => routeCheck.path === expectedRoute) ? 'PASS' : 'FAIL', routeChecks.some((routeCheck) => routeCheck.path === expectedRoute)
                ? 'Expected observability route is declared.'
                : 'Expected observability route is missing.'));
        }
        checks.push((0, platformVerification_1.makeCheck)(CATEGORY, 'Observability routes require auth and admin middleware', routeChecks.every((routeCheck) => routeCheck.requiresAuth && routeCheck.requiresAdmin) ? 'PASS' : 'FAIL', routeChecks.every((routeCheck) => routeCheck.requiresAuth && routeCheck.requiresAdmin)
            ? 'All observability routes are structurally gated by auth and admin middleware.'
            : 'One or more observability routes are missing auth/admin middleware.'));
    }
    riskRegister.push((0, platformVerification_1.makeRisk)(CATEGORY, 'low', 'Observability controllers are not executed by the harness', 'The proof bundle verifies observability files, routes, and admin gating statically. It does not execute telemetry, readiness, or deployment snapshots.'));
    return (0, platformVerification_1.finalizeSection)({ category: CATEGORY, checks, routeChecks, riskRegister });
}
