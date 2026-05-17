export const CACHE_POLICIES = {
  district: {
    ttlMinutes: 180,
    namespace: 'district_cache',
  },
  comparable: {
    ttlMinutes: 120,
    namespace: 'comparable_cache',
  },
  spatial: {
    ttlMinutes: 240,
    namespace: 'spatial_cache',
  },
} as const;
