import { OpportunityLevel } from './strategicOpportunityEngine';

export function municipalityExpansionOpportunity(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  evidenceLineage: unknown[];
  governanceState: string;
  municipalitySignals: number;
  planningProbability: number;
}) {
  const score = Math.max(0, Math.min(100, input.municipalitySignals * 12 + input.planningProbability * 0.5));
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
    noMunicipalityApprovalImplied: true,
    deterministic: true,
  };
}
