import { RUNTIME_THRESHOLDS } from '../config/runtime/runtimeThresholds';
import { getRedisHealth } from '../redis/redisHealth';
import { getAlertQueueState } from '../queues/alertQueue';
import { getAnalysisQueueState } from '../queues/analysisQueue';
import { getGeoQueueState } from '../queues/geoQueue';
import { getIngestionQueueState } from '../queues/ingestionQueue';
import { getMarketQueueState } from '../queues/marketQueue';
import { getRuntimeConfig } from './runtimeConfig';
import { RuntimeStatus } from './runtimeState';
import { toWorkerState } from './workerFactory';
import { ensureAnalysisWorker } from '../workers/analysisWorker';
import { ensureMarketWorker } from '../workers/marketWorker';
import { ensureGeoWorker } from '../workers/geoWorker';
import { ensureAlertWorker } from '../workers/alertWorker';
import { ensureIngestionWorker } from '../workers/ingestionWorker';

export async function buildRuntimeManagerSnapshot() {
  const config = getRuntimeConfig();
  const redisHealth = await getRedisHealth();

  if (config.workersEnabled && redisHealth.connected && redisHealth.state !== 'FAILED') {
    await Promise.all([
      ensureAnalysisWorker(),
      ensureMarketWorker(),
      ensureGeoWorker(),
      ensureAlertWorker(),
      ensureIngestionWorker(),
    ]);
  }

  const queueStates = await Promise.all([
    getAnalysisQueueState(),
    getMarketQueueState(),
    getGeoQueueState(),
    getAlertQueueState(),
    getIngestionQueueState(),
  ]);

  const workerStates = [
    toWorkerState('analysis', 'analysis'),
    toWorkerState('market', 'market'),
    toWorkerState('geo', 'geo'),
    toWorkerState('alert', 'alert'),
    toWorkerState('ingestion', 'ingestion'),
  ];

  const queueDegradedCount = queueStates.filter((q) => ['DEGRADED', 'FAILED'].includes(q.state)).length;
  const workerDegradedCount = workerStates.filter((w) => ['DEGRADED', 'FAILED'].includes(w.state)).length;

  const queueRatio = queueDegradedCount / Math.max(1, queueStates.length);
  const workerRatio = workerDegradedCount / Math.max(1, workerStates.length);

  let state: RuntimeStatus['state'] = 'READY';
  let reason = 'Runtime is ready.';
  let mode: RuntimeStatus['mode'] = 'production-ready';

  if (!config.distributedRuntimeEnabled) {
    state = 'DISABLED';
    reason = 'Distributed runtime is disabled by configuration.';
    mode = 'standby';
  } else if (!config.redisConfigured) {
    state = 'NOT_CONFIGURED';
    reason = 'REDIS_URL is not configured for distributed runtime.';
    mode = 'standby';
  } else if (redisHealth.state === 'FAILED') {
    state = 'FAILED';
    reason = `Redis health failed: ${redisHealth.message}`;
    mode = 'degraded';
  } else if (queueStates.some((q) => q.state === 'FAILED') || workerStates.some((w) => w.state === 'FAILED')) {
    state = 'FAILED';
    reason = 'At least one queue or worker is failed.';
    mode = 'degraded';
  } else if (
    redisHealth.state === 'DEGRADED' ||
    queueRatio >= RUNTIME_THRESHOLDS.degradedQueueRatio ||
    workerRatio >= RUNTIME_THRESHOLDS.degradedWorkerRatio
  ) {
    state = 'DEGRADED';
    reason = 'Runtime entered degraded mode due to Redis or queue worker thresholds.';
    mode = 'degraded';
  } else if (queueStates.some((q) => q.state === 'RUNNING') || workerStates.some((w) => w.state === 'RUNNING')) {
    state = 'RUNNING';
    reason = 'Runtime has active distributed execution.';
  }

  const runtimeStatus: RuntimeStatus = {
    state,
    reason,
    mode,
    redisConfigured: config.redisConfigured,
    bullmqConfigured: config.bullmqEnabled,
    distributedRuntimeEnabled: config.distributedRuntimeEnabled,
    checkedAt: new Date().toISOString(),
  };

  return {
    runtimeStatus,
    queueStates,
    workerStates,
    redisHealth,
  };
}
