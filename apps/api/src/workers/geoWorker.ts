import { processSpatialRefresh } from '../services/jobs/processSpatialRefresh';
import { ingestMunicipalitySignals } from '../services/ingestion/ingestMunicipalitySignals';

export function geoWorker(input: { propertyId: string; city?: string; district?: string; staleFlags: string[] }) {
  const municipalitySignals = ingestMunicipalitySignals({ city: input.city, district: input.district });
  const refresh = processSpatialRefresh({ propertyId: input.propertyId, staleFlags: input.staleFlags });

  return {
    worker: 'geoWorker',
    municipalitySignals,
    refresh,
  };
}
