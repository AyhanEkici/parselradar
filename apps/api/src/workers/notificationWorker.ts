import NotificationDelivery from '../models/NotificationDelivery';
import { processNotificationDelivery } from '../services/notifications/processNotificationDelivery';

export async function processQueuedNotifications(limit = 50) {
  const queued = await NotificationDelivery.find({ state: 'QUEUED' })
    .sort({ createdAt: 1 })
    .limit(limit)
    .lean();

  const results = [];
  for (const delivery of queued) {
    const processed = await processNotificationDelivery(String(delivery._id));
    results.push(processed);
  }

  return {
    processedCount: results.length,
    results,
  };
}
