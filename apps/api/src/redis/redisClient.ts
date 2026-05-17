import Redis from 'ioredis';
import { REDIS_POLICIES } from '../config/runtime/redisPolicies';
import { getRedisConfig } from './redisConfig';

type RedisRuntimeState = {
  client: Redis | null;
  reconnectCount: number;
  lastError: string | null;
  connectedAt: string | null;
};

const runtimeState: RedisRuntimeState = {
  client: null,
  reconnectCount: 0,
  lastError: null,
  connectedAt: null,
};

function buildRedisClient() {
  const config = getRedisConfig();
  if (!config.redisUrl) return null;

  const client = new Redis(config.redisUrl, {
    maxRetriesPerRequest: 1,
    connectTimeout: REDIS_POLICIES.connectTimeoutMs,
    enableReadyCheck: true,
    tls: config.redisTls ? {} : undefined,
  });

  client.on('reconnecting', () => {
    runtimeState.reconnectCount += 1;
  });

  client.on('error', (error) => {
    runtimeState.lastError = error.message;
  });

  client.on('ready', () => {
    runtimeState.connectedAt = new Date().toISOString();
    runtimeState.lastError = null;
  });

  return client;
}

export function getRedisClient() {
  if (runtimeState.client) return runtimeState.client;
  runtimeState.client = buildRedisClient();
  return runtimeState.client;
}

export function getRedisRuntimeMeta() {
  return {
    reconnectCount: runtimeState.reconnectCount,
    lastError: runtimeState.lastError,
    connectedAt: runtimeState.connectedAt,
  };
}

export async function closeRedisClient() {
  if (runtimeState.client) {
    await runtimeState.client.quit();
    runtimeState.client = null;
    runtimeState.connectedAt = null;
  }
}
