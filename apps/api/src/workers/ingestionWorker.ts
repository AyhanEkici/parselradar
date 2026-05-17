import { Job } from 'bullmq';
import { ensureWorker } from '../runtime/workerFactory';

async function processIngestionJob(job: Job) {
  return {
    processed: true,
    queue: 'ingestion',
    jobId: job.id,
    source: String((job.data as Record<string, unknown>)?.source || 'unknown'),
  };
}

export async function ensureIngestionWorker() {
  return ensureWorker('ingestion', 'ingestion', processIngestionJob);
}
