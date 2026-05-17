import { QUEUE_POLICIES } from '../config/runtime/queuePolicies';
import { enqueueRuntimeJob, getRuntimeQueueState } from './runtimeQueueUtils';

export async function enqueueGeo(payload: Record<string, unknown>) {
  return enqueueRuntimeJob('geo', 'geo_job', payload);
}

export async function getGeoQueueState() {
  return getRuntimeQueueState('geo', QUEUE_POLICIES.geo.deadLetterEnabled);
}
