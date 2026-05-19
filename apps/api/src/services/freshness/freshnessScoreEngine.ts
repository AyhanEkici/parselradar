export function freshnessScoreEngine(input: {
  observedAt: string;
  ingestedAt: string;
  maxAgeHours: number;
  stalePenalty?: number;
}) {
  const observed = new Date(input.observedAt).getTime();
  const ingested = new Date(input.ingestedAt).getTime();
  const ageHours = Math.max(0, (observed - ingested) / (1000 * 60 * 60));
  const ageRatio = input.maxAgeHours <= 0 ? 1 : Math.min(1, ageHours / input.maxAgeHours);
  const baseScore = Math.round((1 - ageRatio) * 100);
  const penalty = Math.max(0, Math.min(40, input.stalePenalty || 0));
  const score = Math.max(0, Math.min(100, baseScore - penalty));

  return {
    score,
    ageHours: Number(ageHours.toFixed(2)),
    freshness: score >= 80 ? 'FRESH' : score >= 55 ? 'AGING' : 'STALE',
  } as const;
}
