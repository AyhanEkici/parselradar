import { Job } from 'bullmq';
import { ensureWorker } from '../runtime/workerFactory';

async function processAnalysisJob(job: Job) {
  return {
    processed: true,
    queue: 'analysis',
    jobId: job.id,
    payloadKeys: Object.keys((job.data || {}) as Record<string, unknown>),
  };
}

export async function ensureAnalysisWorker() {
  return ensureWorker('analysis', 'analysis', processAnalysisJob);
}
