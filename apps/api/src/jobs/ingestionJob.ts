import { enqueueIngestion } from '../queues/ingestionQueue';

export function ingestionJob(input: { propertyId: string; source: string }) {
  return enqueueIngestion({
    propertyId: input.propertyId,
    source: input.source,
    type: 'ingestion_job',
    queuedAt: new Date().toISOString(),
  });
}
