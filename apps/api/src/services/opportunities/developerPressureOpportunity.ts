import { OpportunityLevel } from './strategicOpportunityEngine';

export function developerPressureOpportunity(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  evidenceLineage: unknown[];
  governanceState: string;
  developerInterest: number;
  liquidityScore: number;
}) {
  const score = Math.max(0, Math.min(100, input.developerInterest * 0.7 + input.liquidityScore * 0.3));
  const level: OpportunityLevel = score >= 82 ? 'HIGH_CONVICTION' : score >= 62 ? 'STRATEGIC' : score >= 35 ? 'WATCHLIST' : 'NONE';

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
