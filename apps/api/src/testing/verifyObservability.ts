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

const CATEGORY = 'Observability';

export function verifyObservability(): VerificationSection {
  const checks = [];
  const riskRegister = [];
  const routeChecks = [];
  const observabilityRoutePath = apiPath('routes', 'observabilityRoutes.ts');

  for (const requiredPath of [
    observabilityRoutePath,
    apiPath('controllers', 'observabilityController.ts'),
    apiPath('health', 'healthController.ts'),
    apiPath('health', 'livenessController.ts'),
    apiPath('health', 'readinessController.ts'),
    apiPath('monitoring', 'buildOperationalSnapshot.ts'),
    apiPath('observability', 'buildObservabilitySnapshot.ts'),
    apiPath('telemetry', 'telemetryProvider.ts'),
    webPath('pages', 'AdminObservability.tsx'),
    webPath('pages', 'AdminAnalytics.tsx'),
    webPath('pages', 'AdminSystemRuntime.tsx'),
    webPath('pages', 'AdminDeploymentOverview.tsx'),
    webPath('pages', 'AdminAuditTimeline.tsx'),
  ]) {
    checks.push(
      makeCheck(
        CATEGORY,
        `${requiredPath.split(/[/\\]/).slice(-1)[0]} exists`,
        fileExists(requiredPath) ? 'PASS' : 'FAIL',
        fileExists(requiredPath) ? 'Required observability file is present.' : 'Required observability file is missing.',
      ),
    );
  }

  if (fileExists(observabilityRoutePath)) {
    routeChecks.push(...parseExpressRouterFile(CATEGORY, observabilityRoutePath, '/'));
    for (const expectedRoute of ['/admin/observability', '/admin/analytics', '/admin/telemetry']) {
      checks.push(
        makeCheck(
          CATEGORY,
          `Observability route ${expectedRoute}`,
          routeChecks.some((routeCheck) => routeCheck.path === expectedRoute) ? 'PASS' : 'FAIL',
          routeChecks.some((routeCheck) => routeCheck.path === expectedRoute)
            ? 'Expected observability route is declared.'
            : 'Expected observability route is missing.',
        ),
      );
    }
    checks.push(
      makeCheck(
        CATEGORY,
        'Observability routes require auth and admin middleware',
        routeChecks.every((routeCheck) => routeCheck.requiresAuth && routeCheck.requiresAdmin) ? 'PASS' : 'FAIL',
        routeChecks.every((routeCheck) => routeCheck.requiresAuth && routeCheck.requiresAdmin)
          ? 'All observability routes are structurally gated by auth and admin middleware.'
          : 'One or more observability routes are missing auth/admin middleware.',
      ),
    );
  }

  riskRegister.push(
    makeRisk(
      CATEGORY,
      'low',
      'Observability controllers are not executed by the harness',
      'The proof bundle verifies observability files, routes, and admin gating statically. It does not execute telemetry, readiness, or deployment snapshots.',
    ),
  );

  return finalizeSection({ category: CATEGORY, checks, routeChecks, riskRegister });
}