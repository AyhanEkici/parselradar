import { Job } from 'bullmq';
import { ensureWorker } from '../runtime/workerFactory';

async function processAlertJob(job: Job) {
  return {
    processed: true,
    queue: 'alert',
    jobId: job.id,
    signalCount: Number((job.data as Record<string, unknown>)?.signalCount || 0),
  };
}

export async function ensureAlertWorker() {
  return ensureWorker('alert', 'alert', processAlertJob);
}
