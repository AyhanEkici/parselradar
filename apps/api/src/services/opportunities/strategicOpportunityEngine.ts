export type OpportunityLevel = 'NONE' | 'WATCHLIST' | 'STRATEGIC' | 'HIGH_CONVICTION';

export function strategicOpportunityEngine(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  evidenceLineage: unknown[];
  governanceState: string;
  opportunityScore: number;
  anomalyPenalty: number;
}) {
  const score = Math.max(0, Math.min(100, (input.opportunityScore || 0) - Math.max(0, input.anomalyPenalty || 0)));
  const level: OpportunityLevel = score >= 82 ? 'HIGH_CONVICTION' : score >= 62 ? 'STRATEGIC' : score >= 38 ? 'WATCHLIST' : 'NONE';

  return {
    source: input.source,
    timestamp: input.timestamp,
    freshness: input.freshness,
    confidence: input.confidence,
    evidenceLineage: input.evidenceLineage || [],
    governanceState: input.governanceState,
    level,
    strategicScore: score,
    noGuaranteeImplied: true,
    deterministic: true,
  };
}
