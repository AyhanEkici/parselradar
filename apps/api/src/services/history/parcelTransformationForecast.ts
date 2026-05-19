export function parcelTransformationForecast(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  evidenceLineage: unknown[];
  governanceState: string;
  planningProbability: number;
  developmentProbability: number;
}) {
  const score = Math.max(0, Math.min(100, input.planningProbability * 0.45 + input.developmentProbability * 0.55));
  return {
    source: input.source,
    timestamp: input.timestamp,
    freshness: input.freshness,
    confidence: input.confidence,
    evidenceLineage: input.evidenceLineage || [],
    governanceState: input.governanceState,
    direction: score >= 82 ? 'TRANSFORMING' : score >= 62 ? 'ACCELERATING' : score >= 35 ? 'DEVELOPING' : score >= 15 ? 'STATIC' : 'DECLINING',
    forecastScore: Math.round(score),
    deterministic: true,
  };
}
