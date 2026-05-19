import { OpportunityLevel } from './strategicOpportunityEngine';

export function infrastructureUpsideOpportunity(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  evidenceLineage: unknown[];
  governanceState: string;
  infrastructurePressure: number;
  roadAccessScore: number;
}) {
  const score = Math.max(0, Math.min(100, input.infrastructurePressure * 0.6 + input.roadAccessScore * 0.4));
  const level: OpportunityLevel = score >= 82 ? 'HIGH_CONVICTION' : score >= 62 ? 'STRATEGIC' : score >= 40 ? 'WATCHLIST' : 'NONE';

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
