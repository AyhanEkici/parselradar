import { MONITORING_THRESHOLDS } from '../config/runtime/monitoringThresholds';
import { SECURITY_POLICIES } from '../config/runtime/securityPolicies';
import { SecuritySignal } from '../runtime/runtimeState';

export function detectSuspiciousActivity(input: {
  rapidRequestCount?: number;
  distinctRoutes?: number;
  authFailures?: number;
  fingerprint?: string;
}): SecuritySignal[] {
  const signals: SecuritySignal[] = [];

  if ((input.rapidRequestCount || 0) >= SECURITY_POLICIES.maxRapidRequests) {
    signals.push({
      level: 'high',
      type: 'rapid_request_burst',
      message: 'Request burst exceeds security policy threshold.',
      fingerprint: input.fingerprint,
    });
  }

  if ((input.distinctRoutes || 0) >= SECURITY_POLICIES.maxDistinctRoutesPerWindow) {
    signals.push({
      level: 'medium',
      type: 'route_spray_pattern',
      message: 'Distinct route activity exceeds expected operational window.',
      fingerprint: input.fingerprint,
    });
  }

  if ((input.authFailures || 0) >= MONITORING_THRESHOLDS.securitySignalWarning) {
    const authFailures = input.authFailures || 0;
    signals.push({
      level: authFailures >= MONITORING_THRESHOLDS.securitySignalCritical ? 'high' : 'medium',
      type: 'auth_failure_pattern',
      message: 'Authentication failures indicate possible brute-force behavior.',
      fingerprint: input.fingerprint,
    });
  }

  return signals;
}
