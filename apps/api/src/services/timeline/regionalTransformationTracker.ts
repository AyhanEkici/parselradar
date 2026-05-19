export function regionalTransformationTracker(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  evidenceLineage: unknown[];
  governanceState: string;
  indicators: Array<{ key: string; score: number }>;
}) {
  const indicators = input.indicators || [];
  const avg = indicators.length
    ? Math.round(indicators.reduce((sum, i) => sum + Math.max(0, Math.min(100, i.score)), 0) / indicators.length)
    : 0;

  return {
    source: input.source,
    timestamp: input.timestamp,
    freshness: input.freshness,
    confidence: input.confidence,
    evidenceLineage: input.evidenceLineage || [],
    governanceState: input.governanceState,
    direction: avg >= 80 ? 'TRANSFORMING' : avg >= 60 ? 'ACCELERATING' : avg >= 35 ? 'DEVELOPING' : avg >= 15 ? 'STATIC' : 'DECLINING',
    transformationScore: avg,
    indicators,
    deterministic: true,
  };
}
