import { RUNTIME_THRESHOLDS } from '../config/runtime/runtimeThresholds';
import { WORKER_POLICIES } from '../config/runtime/workerPolicies';
import { getAlertQueueState } from '../queues/alertQueue';
import { getAnalysisQueueState } from '../queues/analysisQueue';
import { getGeoQueueState } from '../queues/geoQueue';
import { getIngestionQueueState } from '../queues/ingestionQueue';
import { getMarketQueueState } from '../queues/marketQueue';
import { getRuntimeConfig } from './runtimeConfig';
import { QueueState, RuntimeStatus, WorkerState } from './runtimeState';

function buildWorkerState(name: keyof typeof WORKER_POLICIES, queueState: QueueState): WorkerState {
  const config = getRuntimeConfig();
  const policy = WORKER_POLICIES[name];
  const envKey = `${name.replace(/([A-Z])/g, '_$1').toUpperCase()}_RUNNING`;
  const runningFlag = process.env[envKey] === '1';
  const failFlag = process.env[`${name.replace(/([A-Z])/g, '_$1').toUpperCase()}_FAIL`] === '1';

  let state: WorkerState['state'] = 'READY';
  let reason = 'Worker initialized.';

  if (!config.redisConfigured) {
    state = 'NOT_CONFIGURED';
    reason = 'REDIS_URL is missing, worker cannot run in distributed mode.';
  } else if (!config.workersEnabled || !policy.enabledByDefault) {
    state = 'DISABLED';
    reason = 'Workers are disabled by configuration.';
  } else if (failFlag || queueState.state === 'FAILED') {
    state = 'FAILED';
    reason = 'Worker or upstream queue is failed.';
  } else if (queueState.state === 'DEGRADED') {
    state = 'DEGRADED';
    reason = 'Queue degraded, worker switched to degraded mode.';
  } else if (runningFlag) {
    state = 'RUNNING';
    reason = 'Worker is marked running by runtime flag.';
  }

  return {
    name,
    queueName: queueState.name,
    state,
    reason,
    concurrency: policy.concurrency,
    checkedAt: new Date().toISOString(),
  };
}

export function buildRuntimeManagerSnapshot() {
  const config = getRuntimeConfig();
  const queueStates: QueueState[] = [
    getAnalysisQueueState(),
    getMarketQueueState(),
    getGeoQueueState(),
    getAlertQueueState(),
    getIngestionQueueState(),
  ];

  const workerStates: WorkerState[] = [
    buildWorkerState('analysisWorker', queueStates[0]),
    buildWorkerState('marketWorker', queueStates[1]),
    buildWorkerState('geoWorker', queueStates[2]),
    buildWorkerState('alertWorker', queueStates[3]),
    buildWorkerState('ingestionWorker', queueStates[4]),
  ];

  const queueDegradedCount = queueStates.filter((q) => ['DEGRADED', 'FAILED'].includes(q.state)).length;
  const workerDegradedCount = workerStates.filter((w) => ['DEGRADED', 'FAILED'].includes(w.state)).length;

  const queueRatio = queueDegradedCount / Math.max(1, queueStates.length);
  const workerRatio = workerDegradedCount / Math.max(1, workerStates.length);

  let state: RuntimeStatus['state'] = 'READY';
  let reason = 'Runtime is ready.';
  let mode: RuntimeStatus['mode'] = 'production-ready';

  if (!config.redisConfigured) {
    state = 'NOT_CONFIGURED';
    reason = 'REDIS_URL is not configured for distributed queue runtime.';
    mode = 'standby';
  } else if (!config.queuesEnabled && !config.workersEnabled) {
    state = 'DISABLED';
    reason = 'Queues and workers are disabled by runtime flags.';
    mode = 'standby';
  } else if (queueStates.some((q) => q.state === 'FAILED') || workerStates.some((w) => w.state === 'FAILED')) {
    state = 'FAILED';
    reason = 'At least one queue or worker is failed.';
    mode = 'degraded';
  } else if (queueRatio >= RUNTIME_THRESHOLDS.degradedQueueRatio || workerRatio >= RUNTIME_THRESHOLDS.degradedWorkerRatio) {
    state = 'DEGRADED';
    reason = 'Runtime degraded ratio threshold is exceeded.';
    mode = 'degraded';
  } else if (queueStates.some((q) => q.state === 'RUNNING') || workerStates.some((w) => w.state === 'RUNNING')) {
    state = 'RUNNING';
    reason = 'Runtime has active queue or worker execution.';
    mode = 'production-ready';
  }

  const runtimeStatus: RuntimeStatus = {
    state,
    reason,
    mode,
    redisConfigured: config.redisConfigured,
    bullmqConfigured: config.bullmqEnabled,
    checkedAt: new Date().toISOString(),
  };

  return { runtimeStatus, queueStates, workerStates };
}
