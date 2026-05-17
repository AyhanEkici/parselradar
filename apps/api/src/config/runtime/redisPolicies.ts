export const REDIS_POLICIES = {
  connectTimeoutMs: 2500,
  pingTimeoutMs: 2000,
  degradedLatencyMs: 180,
  failedLatencyMs: 1200,
  maxReconnectsBeforeDegraded: 5,
} as const;
