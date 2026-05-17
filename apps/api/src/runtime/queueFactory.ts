import { Queue } from 'bullmq';
import { BULLMQ_POLICIES } from '../config/runtime/bullmqPolicies';
import { getRedisHealth } from '../redis/redisHealth';
import { getRedisClient } from '../redis/redisClient';
import { getRedisConfig } from '../redis/redisConfig';
import { registerQueueEvents, getQueueEventCounters } from './queueEvents';
import { RuntimeQueueName } from './retryPolicies';

const queueRegistry = new Map<RuntimeQueueName, Queue>();

type LocalQueueMetrics = {
  pending: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  retrying: number;
};

const localQueueMetrics = new Map<RuntimeQueueName, LocalQueueMetrics>();

function getLocalMetrics(queueName: RuntimeQueueName) {
  const existing = localQueueMetrics.get(queueName);
  if (existing) return existing;
  const created: LocalQueueMetrics = {
    pending: 0,
    active: 0,
    completed: 0,
    failed: 0,
    delayed: 0,
    retrying: 0,
  };
  localQueueMetrics.set(queueName, created);
  return created;
}

export async function getOrCreateQueue(queueName: RuntimeQueueName) {
  const config = getRedisConfig();
  if (!config.enableDistributedRuntime) {
    return {
      queue: null,
      distributed: false,
      reason: 'Distributed runtime is disabled.',
    };
  }

  const health = await getRedisHealth();
  if (!health.connected || ['NOT_CONFIGURED', 'FAILED', 'DISABLED'].includes(health.state)) {
    return {
      queue: null,
      distributed: false,
      reason: `Redis unavailable for distributed queue: ${health.message}`,
    };
  }

  const existing = queueRegistry.get(queueName);
  if (existing) {
    return {
      queue: existing,
      distributed: true,
      reason: 'Distributed queue is ready.',
    };
  }

  const redis = getRedisClient();
  if (!redis) {
    return {
      queue: null,
      distributed: false,
      reason: 'Redis client is not available.',
    };
  }

  try {
    const queue = new Queue(BULLMQ_POLICIES.queueNames[queueName], {
      connection: redis,
      prefix: config.redisPrefix,
    });
    queueRegistry.set(queueName, queue);
    await registerQueueEvents(BULLMQ_POLICIES.queueNames[queueName]);

    return {
      queue,
      distributed: true,
      reason: 'Distributed queue created.',
    };
  } catch (error: any) {
    return {
      queue: null,
      distributed: false,
      reason: error?.message || 'Failed to create queue.',
    };
  }
}

export function markLocalQueued(queueName: RuntimeQueueName) {
  const metrics = getLocalMetrics(queueName);
  metrics.pending += 1;
}

export function markLocalCompleted(queueName: RuntimeQueueName) {
  const metrics = getLocalMetrics(queueName);
  metrics.pending = Math.max(0, metrics.pending - 1);
  metrics.completed += 1;
}

export function markLocalFailed(queueName: RuntimeQueueName) {
  const metrics = getLocalMetrics(queueName);
  metrics.pending = Math.max(0, metrics.pending - 1);
  metrics.failed += 1;
  metrics.retrying += 1;
}

function toMetricsFromCounts(counts: Partial<Record<'waiting' | 'active' | 'completed' | 'failed' | 'delayed', number>>) {
  return {
    pending: counts.waiting || 0,
    active: counts.active || 0,
    completed: counts.completed || 0,
    failed: counts.failed || 0,
    delayed: counts.delayed || 0,
  };
}

export async function getQueueMetrics(queueName: RuntimeQueueName) {
  const queue = queueRegistry.get(queueName);
  const fallback = getLocalMetrics(queueName);

  if (!queue) {
    return {
      ...fallback,
      retrying: fallback.retrying,
      backend: 'LOCAL_FALLBACK' as const,
    };
  }

  try {
    const counts = await queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed');
    const counters = getQueueEventCounters(BULLMQ_POLICIES.queueNames[queueName]);
    const normalized = toMetricsFromCounts(counts);

    return {
      ...normalized,
      retrying: counters.retrying,
      backend: 'DISTRIBUTED' as const,
    };
  } catch {
    return {
      ...fallback,
      retrying: fallback.retrying,
      backend: 'LOCAL_FALLBACK' as const,
    };
  }
}

export async function closeQueues() {
  for (const queue of queueRegistry.values()) {
    await queue.close();
  }
  queueRegistry.clear();
}
