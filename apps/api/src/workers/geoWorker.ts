import { Job } from 'bullmq';
import { processSpatialRefresh } from '../services/jobs/processSpatialRefresh';
import { ingestMunicipalitySignals } from '../services/ingestion/ingestMunicipalitySignals';
import { ensureWorker } from '../runtime/workerFactory';

export function geoWorker(input: { propertyId: string; city?: string; district?: string; staleFlags: string[] }) {
  const municipalitySignals = ingestMunicipalitySignals({ city: input.city, district: input.district });
  const refresh = processSpatialRefresh({ propertyId: input.propertyId, staleFlags: input.staleFlags });

  return {
    worker: 'geoWorker',
    municipalitySignals,
    refresh,
  };
}

async function processGeoJob(job: Job) {
  const data = (job.data || {}) as Record<string, unknown>;
  return {
    processed: true,
    queue: 'geo',
    jobId: job.id,
    propertyId: String(data.propertyId || ''),
  };
}

export async function ensureGeoWorker() {
  return ensureWorker('geo', 'geo', processGeoJob);
}
