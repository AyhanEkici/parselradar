import { ingestInfrastructureSignals } from '../services/ingestion/ingestInfrastructureSignals';
import { invalidateRegionalCache } from '../services/cache/invalidateRegionalCache';

export function infrastructureWorker(input: { city?: string; districtKey: string }) {
  const infrastructureSignals = ingestInfrastructureSignals({ city: input.city });
  const invalidation = invalidateRegionalCache({ districtKey: input.districtKey });

  return {
    worker: 'infrastructureWorker',
    infrastructureSignals,
    invalidation,
  };
}
