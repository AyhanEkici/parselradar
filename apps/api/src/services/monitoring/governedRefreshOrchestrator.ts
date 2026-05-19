import { sourceRefreshScheduler } from '../freshness/sourceRefreshScheduler';

export function governedRefreshOrchestrator(input: {
  source: string;
  state: string;
  freshnessScore: number;
  governanceState: string;
  suppression?: boolean;
}) {
  if (input.suppression) {
    return {
      source: input.source,
      action: 'SUPPRESSED',
      governanceControlled: true,
      reason: 'alert_or_refresh_suppression',
      deterministic: true,
    };
  }

  if (input.governanceState !== 'ALLOW') {
    return {
      source: input.source,
      action: 'BLOCKED',
      governanceControlled: true,
      reason: `governance_${String(input.governanceState).toLowerCase()}`,
      deterministic: true,
    };
  }

  const plan = sourceRefreshScheduler({
    source: input.source,
    state: input.state,
    freshnessScore: input.freshnessScore,
  });

  return {
    ...plan,
    governanceControlled: true,
    deterministic: true,
  };
}
