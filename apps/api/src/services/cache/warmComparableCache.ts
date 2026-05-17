import { CACHE_POLICIES } from '../../config/ingestion/cachePolicies';

type ComparableCacheEntry = {
  key: string;
  namespace: string;
  cachedAt: string;
  ttlMinutes: number;
  comparableCount: number;
};

const comparableCache = new Map<string, ComparableCacheEntry>();

export function warmComparableCache(input: { districtKey: string; comparableCount: number }) {
  const key = `${CACHE_POLICIES.comparable.namespace}:${input.districtKey}`;
  const entry: ComparableCacheEntry = {
    key,
    namespace: CACHE_POLICIES.comparable.namespace,
    cachedAt: new Date().toISOString(),
    ttlMinutes: CACHE_POLICIES.comparable.ttlMinutes,
    comparableCount: input.comparableCount,
  };
  comparableCache.set(key, entry);
  return entry;
}

export function getComparableCache(key: string) {
  return comparableCache.get(key) || null;
}
