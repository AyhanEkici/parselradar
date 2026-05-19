import { ConnectorActivationState } from './connectorCapabilityMatrix';

export function connectorHealthClassifier(input: {
  state: ConnectorActivationState;
  freshnessScore: number;
  lastFailureAt?: string | null;
}) {
  if (input.state === 'FAILED') {
    return { health: 'critical', reason: 'connector_failed', visibility: 'show_degradation' as const };
  }
  if (input.state === 'DEGRADED' || input.state === 'RATE_LIMITED') {
    return { health: 'degraded', reason: input.state.toLowerCase(), visibility: 'show_degradation' as const };
  }
  if (input.state === 'LEGAL_REVIEW' || input.state === 'DISABLED') {
    return { health: 'guarded', reason: input.state.toLowerCase(), visibility: 'show_guardrail' as const };
  }
  if (input.state === 'ACTIVE' && input.freshnessScore >= 70) {
    return { health: 'healthy', reason: 'active_and_fresh', visibility: 'normal' as const };
  }
  if (input.state === 'ACTIVE' && input.freshnessScore < 70) {
    return { health: 'watch', reason: 'active_but_stale', visibility: 'show_freshness_downgrade' as const };
  }
  return { health: 'standby', reason: input.state.toLowerCase(), visibility: 'normal' as const };
}
