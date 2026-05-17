import { QUEUE_POLICIES } from '../config/runtime/queuePolicies';
import { enqueueRuntimeJob, getRuntimeQueueState } from './runtimeQueueUtils';

export async function enqueueIngestion(payload: Record<string, unknown>) {
  return enqueueRuntimeJob('ingestion', 'ingestion_job', payload);
}

export async function getIngestionQueueState() {
  return getRuntimeQueueState('ingestion', QUEUE_POLICIES.ingestion.deadLetterEnabled);
}
