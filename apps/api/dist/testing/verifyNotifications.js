"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyNotifications = verifyNotifications;
const platformVerification_1 = require("./platformVerification");
const CATEGORY = 'Notifications';
const EMAIL_ENV_KEYS = ['NOTIFY_EMAIL_FROM', 'NOTIFY_SMTP_HOST', 'NOTIFY_SMTP_USER', 'NOTIFY_SMTP_PASS'];
function verifyNotifications() {
    const checks = [];
    const routeChecks = [];
    const riskRegister = [];
    const missingExternalConfigs = [];
    const notificationStates = [];
    const routesPath = (0, platformVerification_1.apiPath)('routes', 'notificationRoutes.ts');
    const providerConfigPath = (0, platformVerification_1.apiPath)('config', 'notifications', 'deliveryProviders.ts');
    for (const requiredPath of [
        routesPath,
        (0, platformVerification_1.apiPath)('controllers', 'notificationController.ts'),
        providerConfigPath,
        (0, platformVerification_1.apiPath)('models', 'NotificationEvent.ts'),
        (0, platformVerification_1.apiPath)('models', 'NotificationDelivery.ts'),
        (0, platformVerification_1.apiPath)('models', 'NotificationPreference.ts'),
        (0, platformVerification_1.apiPath)('models', 'NotificationDigest.ts'),
        (0, platformVerification_1.apiPath)('services', 'notifications', 'buildNotificationInbox.ts'),
        (0, platformVerification_1.apiPath)('services', 'notifications', 'processNotificationDelivery.ts'),
        (0, platformVerification_1.apiPath)('services', 'notifications', 'queueNotificationDelivery.ts'),
        (0, platformVerification_1.webPath)('pages', 'NotificationInbox.tsx'),
        (0, platformVerification_1.webPath)('pages', 'NotificationPreferences.tsx'),
    ]) {
        checks.push((0, platformVerification_1.makeCheck)(CATEGORY, `${requiredPath.split(/[/\\]/).slice(-1)[0]} exists`, (0, platformVerification_1.fileExists)(requiredPath) ? 'PASS' : 'FAIL', (0, platformVerification_1.fileExists)(requiredPath) ? 'Required notifications surface file is present.' : 'Required notifications surface file is missing.'));
    }
    if ((0, platformVerification_1.fileExists)(routesPath)) {
        routeChecks.push(...(0, platformVerification_1.parseExpressRouterFile)(CATEGORY, routesPath, '/'));
        for (const expectedRoute of [
            '/notifications',
            '/notifications/preferences',
            '/notifications/:id/read',
            '/notifications/:id/archive',
            '/notifications/digests',
            '/notifications/test-event',
        ]) {
            checks.push((0, platformVerification_1.makeCheck)(CATEGORY, `Notification route ${expectedRoute}`, routeChecks.some((routeCheck) => routeCheck.path === expectedRoute) ? 'PASS' : 'FAIL', routeChecks.some((routeCheck) => routeCheck.path === expectedRoute)
                ? 'Expected notification route is declared.'
                : 'Expected notification route declaration is missing.'));
        }
        checks.push((0, platformVerification_1.makeCheck)(CATEGORY, 'Notification routes require auth middleware', routeChecks.every((routeCheck) => routeCheck.requiresAuth) ? 'PASS' : 'FAIL', routeChecks.every((routeCheck) => routeCheck.requiresAuth)
            ? 'All notification routes are structurally gated by auth middleware.'
            : 'One or more notification routes are missing auth middleware.'));
    }
    if ((0, platformVerification_1.fileExists)(providerConfigPath)) {
        const providerConfig = (0, platformVerification_1.readText)(providerConfigPath);
        checks.push((0, platformVerification_1.makeCheck)(CATEGORY, 'Notification provider remains stub-safe', providerConfig.includes("providerName: emailConfigured ? 'stub-email' : 'none'") ? 'PASS' : 'WARN', providerConfig.includes("providerName: emailConfigured ? 'stub-email' : 'none'")
            ? 'Configured email delivery still resolves to a stub-safe provider name.'
            : 'Notification provider config no longer clearly reports a stub-safe provider name.'));
    }
    const missingEmailEnv = (0, platformVerification_1.missingEnvKeys)(EMAIL_ENV_KEYS);
    notificationStates.push({
        channel: 'email',
        state: missingEmailEnv.length === 0 ? 'CONFIGURED' : 'NOT_CONFIGURED',
        status: missingEmailEnv.length === 0 ? 'PASS' : 'WARN',
        missingEnv: missingEmailEnv,
    });
    checks.push((0, platformVerification_1.makeCheck)(CATEGORY, 'Email notification delivery readiness', missingEmailEnv.length === 0 ? 'PASS' : 'WARN', missingEmailEnv.length === 0
        ? 'Email delivery env keys are present.'
        : 'Email delivery env keys are incomplete. Notification delivery remains not configured.', (0, platformVerification_1.envMaskDetail)(EMAIL_ENV_KEYS)));
    for (const key of missingEmailEnv) {
        missingExternalConfigs.push((0, platformVerification_1.makeMissingExternalConfig)(CATEGORY, key, 'Email delivery is not fully configured.', 'WARN'));
    }
    if (routeChecks.some((routeCheck) => routeCheck.path === '/notifications/test-event')) {
        riskRegister.push((0, platformVerification_1.makeRisk)(CATEGORY, 'medium', 'Notification test-event route is mutating', 'A notification test-event route exists in the product API. The verification harness inspects route declarations only and never invokes that endpoint.'));
    }
    return (0, platformVerification_1.finalizeSection)({ category: CATEGORY, checks, routeChecks, riskRegister, missingExternalConfigs, notificationStates });
}
