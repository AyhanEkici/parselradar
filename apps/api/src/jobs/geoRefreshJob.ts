import { enqueueGeo } from '../queues/geoQueue';

export function geoRefreshJob(input: { propertyId: string; city?: string; district?: string }) {
  return enqueueGeo({
    propertyId: input.propertyId,
    city: input.city || null,
    district: input.district || null,
    type: 'geo_refresh_job',
    queuedAt: new Date().toISOString(),
  });
}
