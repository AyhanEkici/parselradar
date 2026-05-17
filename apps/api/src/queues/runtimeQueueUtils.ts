import { QueueState } from '../runtime/runtimeState';
import { getRuntimeConfig } from '../runtime/runtimeConfig';
import { RuntimeQueueName, buildRetryPolicy } from '../runtime/retryPolicies';
import {
  getOrCreateQueue,
  getQueueMetrics,
  markLocalCompleted,
  markLocalFailed,
  markLocalQueued,
} from '../runtime/queueFactory';

export async function enqueueRuntimeJob(queueName: RuntimeQueueName, jobName: string, payload: Record<string, unknown>) {
  const config = getRuntimeConfig();
  if (!config.queuesEnabled) {
    return { accepted: false, reason: 'queues_disabled', mode: 'DISABLED' as const };
  }

  const queueResult = await getOrCreateQueue(queueName);
  if (!queueResult.queue || !queueResult.distributed) {
    markLocalQueued(queueName);
    markLocalCompleted(queueName);
    return {
      accepted: true,
      reason: queueResult.reason,
      mode: 'LOCAL_FALLBACK' as const,
      distributedRuntimeEnabled: config.distributedRuntimeEnabled,
    };
  }

  try {
    await queueResult.queue.add(jobName, payload, buildRetryPolicy(queueName));
    return {
      accepted: true,
      reason: 'Job queued in distributed runtime.',
      mode: 'DISTRIBUTED' as const,
      distributedRuntimeEnabled: config.distributedRuntimeEnabled,
    };
  } catch (error: any) {
    markLocalQueued(queueName);
    markLocalFailed(queueName);
    return {
      accepted: false,
      reason: error?.message || 'Failed to queue distributed job.',
      mode: 'LOCAL_FALLBACK' as const,
      distributedRuntimeEnabled: config.distributedRuntimeEnabled,
    };
  }
}

export async function getRuntimeQueueState(
  queueName: RuntimeQueueName,
  deadLetterReady: boolean
): Promise<QueueState> {
  const config = getRuntimeConfig();
  const queueResult = await getOrCreateQueue(queueName);
  const metrics = await getQueueMetrics(queueName);

  let state: QueueState['state'] = 'READY';
  let reason = queueResult.reason;

  if (!config.distributedRuntimeEnabled) {
    state = 'DISABLED';
    reason = 'Distributed runtime is disabled by configuration.';
  } else if (!config.redisConfigured) {
    state = 'NOT_CONFIGURED';
    reason = 'REDIS_URL is not configured.';
  } else if (metrics.backend === 'LOCAL_FALLBACK') {
    state = 'DEGRADED';
    reason = `LOCAL_FALLBACK: ${queueResult.reason}`;
  } else if (metrics.failed > 0 && metrics.failed >= metrics.completed + 10) {
    state = 'FAILED';
    reason = 'Queue failure count exceeds safe threshold.';
  } else if (metrics.active > 0 || metrics.pending > 0) {
    state = 'RUNNING';
    reason = 'Queue has active distributed jobs.';
  }

  return {
    name: queueName,
    state,
    reason,
    backend: metrics.backend === 'DISTRIBUTED' ? 'redis-bullmq' : 'local-fallback',
    depth: metrics.pending + metrics.active + metrics.delayed,
    retries: metrics.retrying,
    failures: metrics.failed,
    deadLetterReady,
    checkedAt: new Date().toISOString(),
  };
}
