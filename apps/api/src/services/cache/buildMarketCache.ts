import { CACHE_POLICIES } from '../../config/ingestion/cachePolicies';

type CacheEntry = {
  key: string;
  namespace: string;
  createdAt: string;
  ttlMinutes: number;
  payload: Record<string, unknown>;
};

const cacheStore = new Map<string, CacheEntry>();

export function buildMarketCache(input: { districtKey: string; payload: Record<string, unknown> }) {
  const key = `${CACHE_POLICIES.district.namespace}:${input.districtKey}`;
  const entry: CacheEntry = {
    key,
    namespace: CACHE_POLICIES.district.namespace,
    createdAt: new Date().toISOString(),
    ttlMinutes: CACHE_POLICIES.district.ttlMinutes,
    payload: input.payload,
  };
  cacheStore.set(key, entry);
  return entry;
}

export function getMarketCache(key: string) {
  return cacheStore.get(key) || null;
}
