import { QueueEvents } from 'bullmq';
import { getRedisClient } from '../redis/redisClient';
import { getRedisConfig } from '../redis/redisConfig';

type QueueEventCounters = {
  completed: number;
  failed: number;
  retrying: number;
  lastError: string | null;
};

const queueEventsRegistry = new Map<string, QueueEvents>();
const queueCounters = new Map<string, QueueEventCounters>();

function getCounters(queueName: string) {
  const current = queueCounters.get(queueName);
  if (current) return current;
  const created: QueueEventCounters = {
    completed: 0,
    failed: 0,
    retrying: 0,
    lastError: null,
  };
  queueCounters.set(queueName, created);
  return created;
}

export async function registerQueueEvents(queueName: string) {
  if (queueEventsRegistry.has(queueName)) return queueEventsRegistry.get(queueName) || null;

  const config = getRedisConfig();
  const redis = getRedisClient();
  if (!config.enableDistributedRuntime || !redis) return null;

  const queueEvents = new QueueEvents(queueName, {
    connection: redis,
    prefix: config.redisPrefix,
  });

  const counters = getCounters(queueName);

  queueEvents.on('completed', () => {
    counters.completed += 1;
  });

  queueEvents.on('failed', () => {
    counters.failed += 1;
    counters.retrying += 1;
  });

  queueEvents.on('error', (error) => {
    counters.lastError = error.message;
  });

  queueEventsRegistry.set(queueName, queueEvents);
  return queueEvents;
}

export function getQueueEventCounters(queueName: string) {
  return getCounters(queueName);
}

export async function closeQueueEvents() {
  for (const item of queueEventsRegistry.values()) {
    await item.close();
  }
  queueEventsRegistry.clear();
}
