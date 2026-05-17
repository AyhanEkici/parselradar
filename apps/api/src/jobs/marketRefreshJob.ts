import { enqueueMarket } from '../queues/marketQueue';

export function marketRefreshJob(input: { propertyId: string; districtKey?: string }) {
  return enqueueMarket({
    propertyId: input.propertyId,
    districtKey: input.districtKey || null,
    type: 'market_refresh_job',
    queuedAt: new Date().toISOString(),
  });
}
