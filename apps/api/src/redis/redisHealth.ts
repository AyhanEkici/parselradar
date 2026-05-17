import { REDIS_POLICIES } from '../config/runtime/redisPolicies';
import type { RuntimeTruthState } from '../runtime/runtimeState';
import { getRedisClient, getRedisRuntimeMeta } from './redisClient';
import { getRedisConfig } from './redisConfig';

export async function getRedisHealth() {
  const config = getRedisConfig();

  if (!config.enableDistributedRuntime) {
    return {
      state: 'DISABLED' as RuntimeTruthState,
      redisStatus: 'DISABLED',
      redisLatency: null as number | null,
      reconnectCount: 0,
      connected: false,
      message: 'Distributed runtime is disabled by configuration.',
    };
  }

  if (!config.redisUrl) {
    return {
      state: 'NOT_CONFIGURED' as RuntimeTruthState,
      redisStatus: 'NOT_CONFIGURED',
      redisLatency: null as number | null,
      reconnectCount: 0,
      connected: false,
      message: 'REDIS_URL is not configured.',
    };
  }

  const client = getRedisClient();
  if (!client) {
    return {
      state: 'FAILED' as RuntimeTruthState,
      redisStatus: 'FAILED',
      redisLatency: null as number | null,
      reconnectCount: getRedisRuntimeMeta().reconnectCount,
      connected: false,
      message: 'Redis client initialization failed.',
    };
  }

  const startedAt = Date.now();
  try {
    const pingPromise = client.ping();
    const timeoutPromise = new Promise<string>((_resolve, reject) => {
      setTimeout(() => reject(new Error('Redis ping timeout')), REDIS_POLICIES.pingTimeoutMs);
    });

    await Promise.race([pingPromise, timeoutPromise]);
    const redisLatency = Date.now() - startedAt;
    const meta = getRedisRuntimeMeta();

    let state: RuntimeTruthState = 'READY';
    let redisStatus = 'READY';
    let message = 'Redis is reachable.';

    if (redisLatency >= REDIS_POLICIES.failedLatencyMs) {
      state = 'FAILED';
      redisStatus = 'FAILED';
      message = `Redis latency is critically high (${redisLatency}ms).`;
    } else if (
      redisLatency >= REDIS_POLICIES.degradedLatencyMs ||
      meta.reconnectCount >= REDIS_POLICIES.maxReconnectsBeforeDegraded
    ) {
      state = 'DEGRADED';
      redisStatus = 'DEGRADED';
      message = `Redis is reachable but degraded (latency=${redisLatency}ms, reconnects=${meta.reconnectCount}).`;
    }

    return {
      state,
      redisStatus,
      redisLatency,
      reconnectCount: meta.reconnectCount,
      connected: true,
      message,
    };
  } catch (error: any) {
    return {
      state: 'FAILED' as RuntimeTruthState,
      redisStatus: 'FAILED',
      redisLatency: null as number | null,
      reconnectCount: getRedisRuntimeMeta().reconnectCount,
      connected: false,
      message: error?.message || 'Redis ping failed.',
    };
  }
}
