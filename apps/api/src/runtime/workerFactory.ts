import { Job, Processor, Worker } from 'bullmq';
import { WORKER_CONCURRENCY } from '../config/runtime/workerConcurrency';
import { getRedisHealth } from '../redis/redisHealth';
import { getRedisClient } from '../redis/redisClient';
import { getRedisConfig } from '../redis/redisConfig';
import type { WorkerState } from './runtimeState';

export type RuntimeWorkerName = keyof typeof WORKER_CONCURRENCY;

type WorkerMetric = {
  processed: number;
  failed: number;
  restarted: number;
  lastStartedAt: string | null;
  running: boolean;
};

const workerRegistry = new Map<RuntimeWorkerName, Worker>();
const workerMetrics = new Map<RuntimeWorkerName, WorkerMetric>();

function getMetric(name: RuntimeWorkerName) {
  const existing = workerMetrics.get(name);
  if (existing) return existing;
  const created: WorkerMetric = {
    processed: 0,
    failed: 0,
    restarted: 0,
    lastStartedAt: null,
    running: false,
  };
  workerMetrics.set(name, created);
  return created;
}

function envConcurrency(name: RuntimeWorkerName) {
  const raw = Number(process.env.WORKER_CONCURRENCY || WORKER_CONCURRENCY[name]);
  if (Number.isNaN(raw) || raw <= 0) return WORKER_CONCURRENCY[name];
  return raw;
}

export async function ensureWorker(
  name: RuntimeWorkerName,
  queueName: string,
  processor: Processor<any, any, string>
) {
  const config = getRedisConfig();
  const metric = getMetric(name);

  if (!config.enableDistributedRuntime) {
    metric.running = false;
    return { worker: null, distributed: false, reason: 'Distributed runtime disabled.' };
  }

  const health = await getRedisHealth();
  if (!health.connected || ['NOT_CONFIGURED', 'FAILED', 'DISABLED'].includes(health.state)) {
    metric.running = false;
    return { worker: null, distributed: false, reason: `Redis unavailable: ${health.message}` };
  }

  const existing = workerRegistry.get(name);
  if (existing) {
    metric.running = true;
    return { worker: existing, distributed: true, reason: 'Worker already running.' };
  }

  const redis = getRedisClient();
  if (!redis) {
    metric.running = false;
    return { worker: null, distributed: false, reason: 'Redis client unavailable.' };
  }

  const worker = new Worker(queueName, async (job: Job) => processor(job), {
    connection: redis,
    prefix: config.redisPrefix,
    concurrency: envConcurrency(name),
  });

  worker.on('completed', () => {
    metric.processed += 1;
  });

  worker.on('failed', () => {
    metric.failed += 1;
  });

  worker.on('error', () => {
    metric.restarted += 1;
  });

  metric.running = true;
  metric.lastStartedAt = new Date().toISOString();
  workerRegistry.set(name, worker);

  return { worker, distributed: true, reason: 'Worker started.' };
}

export function getWorkerMetric(name: RuntimeWorkerName) {
  return getMetric(name);
}

export function toWorkerState(name: RuntimeWorkerName, queueName: string): WorkerState {
  const config = getRedisConfig();
  const metric = getMetric(name);
  const concurrency = envConcurrency(name);

  let state: WorkerState['state'] = 'READY';
  let reason = 'Worker initialized.';

  if (!config.enableDistributedRuntime) {
    state = 'DISABLED';
    reason = 'Distributed runtime is disabled.';
  } else if (!config.redisUrl) {
    state = 'NOT_CONFIGURED';
    reason = 'REDIS_URL is not configured.';
  } else if (metric.failed > metric.processed + 5) {
    state = 'FAILED';
    reason = 'Worker failures exceed safe threshold.';
  } else if (metric.restarted > 2) {
    state = 'DEGRADED';
    reason = 'Worker restart count indicates degraded runtime.';
  } else if (metric.running) {
    state = 'RUNNING';
    reason = 'Worker is running with distributed runtime.';
  }

  return {
    name,
    queueName,
    state,
    reason,
    concurrency,
    checkedAt: new Date().toISOString(),
  };
}

export async function shutdownWorkers() {
  for (const worker of workerRegistry.values()) {
    await worker.close();
  }
  workerRegistry.clear();

  for (const metric of workerMetrics.values()) {
    metric.running = false;
  }
}
