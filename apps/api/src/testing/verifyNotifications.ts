import {
  apiPath,
  envMaskDetail,
  fileExists,
  finalizeSection,
  makeCheck,
  makeMissingExternalConfig,
  makeRisk,
  NotificationTruthState,
  parseExpressRouterFile,
  readText,
  VerificationSection,
  webPath,
  missingEnvKeys,
} from './platformVerification';

const CATEGORY = 'Notifications';
const EMAIL_ENV_KEYS = ['NOTIFY_EMAIL_FROM', 'NOTIFY_SMTP_HOST', 'NOTIFY_SMTP_USER', 'NOTIFY_SMTP_PASS'];

export function verifyNotifications(): VerificationSection {
  const checks = [];
  const routeChecks = [];
  const riskRegister = [];
  const missingExternalConfigs = [];
  const notificationStates: NotificationTruthState[] = [];
  const routesPath = apiPath('routes', 'notificationRoutes.ts');
  const providerConfigPath = apiPath('config', 'notifications', 'deliveryProviders.ts');

  for (const requiredPath of [
    routesPath,
    apiPath('controllers', 'notificationController.ts'),
    providerConfigPath,
    apiPath('models', 'NotificationEvent.ts'),
    apiPath('models', 'NotificationDelivery.ts'),
    apiPath('models', 'NotificationPreference.ts'),
    apiPath('models', 'NotificationDigest.ts'),
    apiPath('services', 'notifications', 'buildNotificationInbox.ts'),
    apiPath('services', 'notifications', 'processNotificationDelivery.ts'),
    apiPath('services', 'notifications', 'queueNotificationDelivery.ts'),
    webPath('pages', 'NotificationInbox.tsx'),
    webPath('pages', 'NotificationPreferences.tsx'),
  ]) {
    checks.push(
      makeCheck(
        CATEGORY,
        `${requiredPath.split(/[/\\]/).slice(-1)[0]} exists`,
        fileExists(requiredPath) ? 'PASS' : 'FAIL',
        fileExists(requiredPath) ? 'Required notifications surface file is present.' : 'Required notifications surface file is missing.',
      ),
    );
  }

  if (fileExists(routesPath)) {
    routeChecks.push(...parseExpressRouterFile(CATEGORY, routesPath, '/'));
    for (const expectedRoute of [
      '/notifications',
      '/notifications/preferences',
      '/notifications/:id/read',
      '/notifications/:id/archive',
      '/notifications/digests',
      '/notifications/test-event',
    ]) {
      checks.push(
        makeCheck(
          CATEGORY,
          `Notification route ${expectedRoute}`,
          routeChecks.some((routeCheck) => routeCheck.path === expectedRoute) ? 'PASS' : 'FAIL',
          routeChecks.some((routeCheck) => routeCheck.path === expectedRoute)
            ? 'Expected notification route is declared.'
            : 'Expected notification route declaration is missing.',
        ),
      );
    }

    checks.push(
      makeCheck(
        CATEGORY,
        'Notification routes require auth middleware',
        routeChecks.every((routeCheck) => routeCheck.requiresAuth) ? 'PASS' : 'FAIL',
        routeChecks.every((routeCheck) => routeCheck.requiresAuth)
          ? 'All notification routes are structurally gated by auth middleware.'
          : 'One or more notification routes are missing auth middleware.',
      ),
    );
  }

  if (fileExists(providerConfigPath)) {
    const providerConfig = readText(providerConfigPath);
    checks.push(
      makeCheck(
        CATEGORY,
        'Notification provider remains stub-safe',
        providerConfig.includes("providerName: emailConfigured ? 'stub-email' : 'none'") ? 'PASS' : 'WARN',
        providerConfig.includes("providerName: emailConfigured ? 'stub-email' : 'none'")
          ? 'Configured email delivery still resolves to a stub-safe provider name.'
          : 'Notification provider config no longer clearly reports a stub-safe provider name.',
      ),
    );
  }

  const missingEmailEnv = missingEnvKeys(EMAIL_ENV_KEYS);
  notificationStates.push({
    channel: 'email',
    state: missingEmailEnv.length === 0 ? 'CONFIGURED' : 'NOT_CONFIGURED',
    status: missingEmailEnv.length === 0 ? 'PASS' : 'WARN',
    missingEnv: missingEmailEnv,
  });

  checks.push(
    makeCheck(
      CATEGORY,
      'Email notification delivery readiness',
      missingEmailEnv.length === 0 ? 'PASS' : 'WARN',
      missingEmailEnv.length === 0
        ? 'Email delivery env keys are present.'
        : 'Email delivery env keys are incomplete. Notification delivery remains not configured.',
      envMaskDetail(EMAIL_ENV_KEYS),
    ),
  );

  for (const key of missingEmailEnv) {
    missingExternalConfigs.push(makeMissingExternalConfig(CATEGORY, key, 'Email delivery is not fully configured.', 'WARN'));
  }

  if (routeChecks.some((routeCheck) => routeCheck.path === '/notifications/test-event')) {
    riskRegister.push(
      makeRisk(
        CATEGORY,
        'medium',
        'Notification test-event route is mutating',
        'A notification test-event route exists in the product API. The verification harness inspects route declarations only and never invokes that endpoint.',
      ),
    );
  }

  return finalizeSection({ category: CATEGORY, checks, routeChecks, riskRegister, missingExternalConfigs, notificationStates });
}
