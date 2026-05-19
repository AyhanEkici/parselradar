export type AlertState = 'INFO' | 'NOTICE' | 'IMPORTANT' | 'HIGH_PRIORITY' | 'CRITICAL';

export function investorAlertEngine(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  evidenceLineage: unknown[];
  governanceState: string;
  alertScore: number;
  suppressed?: boolean;
}) {
  if (input.suppressed) {
    return {
      source: input.source,
      timestamp: input.timestamp,
      freshness: input.freshness,
      confidence: input.confidence,
      evidenceLineage: input.evidenceLineage || [],
      governanceState: input.governanceState,
      state: 'INFO' as AlertState,
      suppressed: true,
      route: 'suppressed',
      deterministic: true,
    };
  }

  const score = Math.max(0, Math.min(100, input.alertScore || 0));
  const state: AlertState = score >= 85 ? 'CRITICAL' : score >= 70 ? 'HIGH_PRIORITY' : score >= 55 ? 'IMPORTANT' : score >= 35 ? 'NOTICE' : 'INFO';

  return {
    source: input.source,
    timestamp: input.timestamp,
    freshness: input.freshness,
    confidence: input.confidence,
    evidenceLineage: input.evidenceLineage || [],
    governanceState: input.governanceState,
    state,
    suppressed: false,
    route: input.governanceState === 'ALLOW' ? 'governed_delivery' : 'governance_block',
    deterministic: true,
  };
}
