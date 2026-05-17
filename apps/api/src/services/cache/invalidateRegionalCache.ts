import { CACHE_POLICIES } from '../../config/ingestion/cachePolicies';
import { getMarketCache } from './buildMarketCache';

const invalidatedKeys = new Set<string>();

export function invalidateRegionalCache(input: { districtKey: string }) {
  const key = `${CACHE_POLICIES.district.namespace}:${input.districtKey}`;
  const hadEntry = Boolean(getMarketCache(key));
  invalidatedKeys.add(key);
  return {
    key,
    invalidated: hadEntry,
    invalidatedAt: new Date().toISOString(),
  };
}

export function isRegionalCacheInvalidated(key: string) {
  return invalidatedKeys.has(key);
}
