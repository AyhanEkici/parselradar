import { enqueueAlert } from '../queues/alertQueue';

export function alertJob(input: { propertyId: string; signalCount?: number }) {
  return enqueueAlert({
    propertyId: input.propertyId,
    signalCount: input.signalCount || 0,
    type: 'alert_job',
    queuedAt: new Date().toISOString(),
  });
}
