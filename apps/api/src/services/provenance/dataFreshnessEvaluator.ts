export function evaluateDataFreshness(input: { freshnessScore?: number; cacheTimestamp?: string | Date }) {
  const freshnessScore = Math.max(0, Math.min(100, Number(input.freshnessScore || 0)));
  const ageDays = input.cacheTimestamp
    ? Math.max(0, Math.round((Date.now() - new Date(input.cacheTimestamp).getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  const freshnessBand = freshnessScore >= 80 ? 'fresh' : freshnessScore >= 55 ? 'aging' : 'stale';

  return {
    freshnessScore,
    ageDays,
    freshnessBand,
  };
}
