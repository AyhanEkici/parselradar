import { QUEUE_POLICIES } from '../config/runtime/queuePolicies';
import { enqueueRuntimeJob, getRuntimeQueueState } from './runtimeQueueUtils';

export async function enqueueMarket(payload: Record<string, unknown>) {
  return enqueueRuntimeJob('market', 'market_job', payload);
}

export async function getMarketQueueState() {
  return getRuntimeQueueState('market', QUEUE_POLICIES.market.deadLetterEnabled);
}
