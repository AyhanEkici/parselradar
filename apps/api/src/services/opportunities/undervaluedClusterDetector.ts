import { OpportunityLevel } from './strategicOpportunityEngine';

export function undervaluedClusterDetector(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  evidenceLineage: unknown[];
  governanceState: string;
  valuationGapPct: number;
  clusterStrength: number;
}) {
  const score = Math.max(0, Math.min(100, input.valuationGapPct * 0.8 + input.clusterStrength * 0.2));
  const level: OpportunityLevel = score >= 80 ? 'HIGH_CONVICTION' : score >= 60 ? 'STRATEGIC' : score >= 35 ? 'WATCHLIST' : 'NONE';

  return {
    source: input.source,
    timestamp: input.timestamp,
    freshness: input.freshness,
    confidence: input.confidence,
    evidenceLineage: input.evidenceLineage || [],
    governanceState: input.governanceState,
    level,
    score,
    deterministic: true,
  };
}
