import { QUEUE_POLICIES } from '../config/runtime/queuePolicies';
import { enqueueRuntimeJob, getRuntimeQueueState } from './runtimeQueueUtils';

export async function enqueueAlert(payload: Record<string, unknown>) {
  return enqueueRuntimeJob('alert', 'alert_job', payload);
}

export async function getAlertQueueState() {
  return getRuntimeQueueState('alert', QUEUE_POLICIES.alert.deadLetterEnabled);
}
