import { QUEUE_POLICIES } from '../config/runtime/queuePolicies';
import { getRuntimeConfig } from '../runtime/runtimeConfig';
import { QueueState } from '../runtime/runtimeState';

let localDepth = 0;
let retries = 0;
let failures = 0;

export function enqueueMarket(payload: Record<string, unknown>) {
  const config = getRuntimeConfig();
  if (!config.queuesEnabled) return { accepted: false, reason: 'queues_disabled' };
  localDepth += 1;
  return { accepted: true, mode: config.redisConfigured && config.bullmqEnabled ? 'redis-bullmq' : 'local-fallback', payloadSize: Object.keys(payload).length };
}

export function getMarketQueueState(): QueueState {
  const config = getRuntimeConfig();
  const failFlag = process.env.MARKET_QUEUE_FAIL === '1';
  const runFlag = process.env.MARKET_QUEUE_RUNNING === '1';
  const degradedFlag = process.env.MARKET_QUEUE_DEGRADED === '1';

  let state: QueueState['state'] = 'READY';
  let reason = 'Queue initialized.';

  if (!config.redisConfigured) {
    state = 'NOT_CONFIGURED';
    reason = 'REDIS_URL is missing; using local fallback contract only.';
  } else if (!config.queuesEnabled) {
    state = 'DISABLED';
    reason = 'Runtime queues are disabled by configuration.';
  } else if (failFlag) {
    state = 'FAILED';
    reason = 'Market queue failure flag is set.';
  } else if (degradedFlag) {
    state = 'DEGRADED';
    reason = 'Market queue degraded flag is set.';
  } else if (runFlag) {
    state = 'RUNNING';
    reason = 'Market queue is marked as running.';
  }

  return {
    name: 'market',
    state,
    reason,
    backend: config.redisConfigured && config.bullmqEnabled ? 'redis-bullmq' : 'local-fallback',
    depth: localDepth,
    retries,
    failures,
    deadLetterReady: QUEUE_POLICIES.market.deadLetterEnabled,
    checkedAt: new Date().toISOString(),
  };
}
