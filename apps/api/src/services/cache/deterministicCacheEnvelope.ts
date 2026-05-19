export function deterministicCacheEnvelope(input: {
  source: string;
  cacheKey: string;
  generatedAt: string;
  freshnessScore: number;
  payloadHash: string;
}) {
  return {
    source: input.source,
    cacheKey: input.cacheKey,
    generatedAt: input.generatedAt,
    freshnessScore: input.freshnessScore,
    payloadHash: input.payloadHash,
    cacheState: input.freshnessScore >= 70 ? 'WARM' : 'STALE',
    deterministic: true,
  } as const;
}
