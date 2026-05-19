export function municipalDirectionForecast(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  evidenceLineage: unknown[];
  governanceState: string;
  municipalitySignalScore: number;
}) {
  const score = Math.max(0, Math.min(100, input.municipalitySignalScore || 0));
  return {
    source: input.source,
    timestamp: input.timestamp,
    freshness: input.freshness,
    confidence: input.confidence,
    evidenceLineage: input.evidenceLineage || [],
    governanceState: input.governanceState,
    direction: score >= 80 ? 'TRANSFORMING' : score >= 60 ? 'ACCELERATING' : score >= 35 ? 'DEVELOPING' : score >= 15 ? 'STATIC' : 'DECLINING',
    municipalityScore: score,
    noMunicipalityApprovalImplied: true,
    deterministic: true,
  };
}
