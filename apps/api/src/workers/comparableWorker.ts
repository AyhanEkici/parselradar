import { ingestComparableListings } from '../services/ingestion/ingestComparableListings';
import { queuePropertyReanalysis } from '../services/jobs/queuePropertyReanalysis';

export function comparableWorker(input: { propertyId: string; sourceRows: Record<string, unknown>[] }) {
  const ingestion = ingestComparableListings({ sourceRows: input.sourceRows });
  const queue = queuePropertyReanalysis({
    propertyId: input.propertyId,
    reason: ingestion.ingestedCount > 0 ? 'comparable_ingestion' : 'comparable_review',
  });

  return {
    worker: 'comparableWorker',
    ingestion,
    queue,
  };
}
