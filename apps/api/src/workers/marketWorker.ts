import { Job } from 'bullmq';
import { ingestComparableListings } from '../services/ingestion/ingestComparableListings';
import { buildMarketCache } from '../services/cache/buildMarketCache';
import { warmComparableCache } from '../services/cache/warmComparableCache';
import { processMarketRefresh } from '../services/jobs/processMarketRefresh';
import { ensureWorker } from '../runtime/workerFactory';

export function marketWorker(input: { propertyId: string; districtKey: string; sourceRows: Record<string, unknown>[]; staleFlags: string[] }) {
  const ingestion = ingestComparableListings({ sourceRows: input.sourceRows });
  const cacheEntry = buildMarketCache({
    districtKey: input.districtKey,
    payload: { ingestedCount: ingestion.ingestedCount, source: ingestion.source },
  });
  const comparableCache = warmComparableCache({
    districtKey: input.districtKey,
    comparableCount: ingestion.ingestedCount,
  });
  const refresh = processMarketRefresh({ propertyId: input.propertyId, staleFlags: input.staleFlags });

  return {
    worker: 'marketWorker',
    ingestion,
    cacheEntry,
    comparableCache,
    refresh,
  };
}

async function processMarketJob(job: Job) {
  const data = (job.data || {}) as Record<string, unknown>;
  return {
    processed: true,
    queue: 'market',
    jobId: job.id,
    propertyId: String(data.propertyId || ''),
  };
}

export async function ensureMarketWorker() {
  return ensureWorker('market', 'market', processMarketJob);
}
