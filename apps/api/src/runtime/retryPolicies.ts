import { JobsOptions } from 'bullmq';
import { BULLMQ_POLICIES } from '../config/runtime/bullmqPolicies';
import { RETRY_THRESHOLDS } from '../config/runtime/retryThresholds';

export type RuntimeQueueName = keyof typeof RETRY_THRESHOLDS;

export function buildRetryPolicy(queueName: RuntimeQueueName): JobsOptions {
  const retry = RETRY_THRESHOLDS[queueName];
  return {
    attempts: retry.attempts,
    backoff: {
      type: 'exponential',
      delay: retry.backoffMs,
    },
    removeOnComplete: BULLMQ_POLICIES.defaultRemoveOnComplete,
    removeOnFail: BULLMQ_POLICIES.defaultRemoveOnFail,
  };
}
