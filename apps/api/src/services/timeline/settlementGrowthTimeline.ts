export function settlementGrowthTimeline(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  evidenceLineage: unknown[];
  governanceState: string;
  periodScores: Array<{ period: string; score: number }>;
}) {
  const points = (input.periodScores || []).slice().sort((a, b) => a.period.localeCompare(b.period));
  const first = points[0]?.score || 0;
  const last = points[points.length - 1]?.score || 0;
  const delta = last - first;

  return {
    source: input.source,
    timestamp: input.timestamp,
    freshness: input.freshness,
    confidence: input.confidence,
    evidenceLineage: input.evidenceLineage || [],
    governanceState: input.governanceState,
    direction: delta >= 25 ? 'TRANSFORMING' : delta >= 15 ? 'ACCELERATING' : delta >= 5 ? 'DEVELOPING' : delta >= -4 ? 'STATIC' : 'DECLINING',
    delta,
    periodScores: points,
    deterministic: true,
  };
}
