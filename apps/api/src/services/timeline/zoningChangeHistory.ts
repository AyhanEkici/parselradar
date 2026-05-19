export function zoningChangeHistory(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  evidenceLineage: unknown[];
  governanceState: string;
  references: Array<{ at: string; zoneCode: string; source: string }>;
}) {
  const timeline = (input.references || []).slice().sort((a, b) => a.at.localeCompare(b.at));
  const certainty = input.confidence >= 85 ? 'HIGH' : input.confidence >= 60 ? 'MEDIUM' : 'LOW';

  return {
    source: input.source,
    timestamp: input.timestamp,
    freshness: input.freshness,
    confidence: input.confidence,
    zoningCertainty: certainty,
    evidenceLineage: input.evidenceLineage || [],
    governanceState: input.governanceState,
    references: timeline,
    noMunicipalityApprovalImplied: true,
    deterministic: true,
  };
}
