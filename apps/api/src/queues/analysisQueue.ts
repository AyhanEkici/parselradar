import { QUEUE_POLICIES } from '../config/runtime/queuePolicies';
import { enqueueRuntimeJob, getRuntimeQueueState } from './runtimeQueueUtils';

export async function enqueueAnalysis(payload: Record<string, unknown>) {
  return enqueueRuntimeJob('analysis', 'analysis_job', payload);
}

export async function getAnalysisQueueState() {
  return getRuntimeQueueState('analysis', QUEUE_POLICIES.analysis.deadLetterEnabled);
}
