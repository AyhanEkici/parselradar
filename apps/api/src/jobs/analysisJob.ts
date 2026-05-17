import { enqueueAnalysis } from '../queues/analysisQueue';

export function analysisJob(input: { propertyId: string; force?: boolean }) {
  return enqueueAnalysis({
    propertyId: input.propertyId,
    force: Boolean(input.force),
    type: 'analysis_job',
    queuedAt: new Date().toISOString(),
  });
}
