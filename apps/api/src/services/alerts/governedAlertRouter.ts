import { buildInsightBase } from '../autonomy/autonomyInsightTypes';

export function governedAlertRouter(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  severity: string;
  suppressed?: boolean;
}) {
  const base = buildInsightBase(input);
  if (input.suppressed) {
    return { ...base, route: 'suppressed', routed: false };
  }
  if (input.governanceState !== 'ALLOW') {
    return { ...base, route: 'governance_block', routed: false };
  }
  return { ...base, route: input.severity === 'CRITICAL' || input.severity === 'HIGH_PRIORITY' ? 'immediate_ops' : 'normal_ops', routed: true };
}
