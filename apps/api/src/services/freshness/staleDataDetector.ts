export function staleDataDetector(input: {
  freshnessScore: number;
  sourceStatuses: string[];
  maxAllowedStaleSources?: number;
}) {
  const staleSources = input.sourceStatuses.filter((status) => status === 'STALE' || status === 'FAILED').length;
  const maxAllowedStale = input.maxAllowedStaleSources ?? 1;
  const stale = input.freshnessScore < 55 || staleSources > maxAllowedStale;

  return {
    stale,
    staleSources,
    downgradeLevel: stale ? (input.freshnessScore < 35 ? 'HIGH' : 'MEDIUM') : 'NONE',
  } as const;
}
