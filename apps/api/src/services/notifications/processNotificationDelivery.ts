import NotificationDelivery from '../../models/NotificationDelivery';
import { resolveDeliveryProviders } from '../../config/notifications/deliveryProviders';

export async function processNotificationDelivery(deliveryId: string) {
  const delivery = await NotificationDelivery.findById(deliveryId).lean();
  if (!delivery) return null;

  if (delivery.state !== 'QUEUED') {
    return delivery;
  }

  if (delivery.channel === 'IN_APP') {
    return NotificationDelivery.findByIdAndUpdate(
      deliveryId,
      {
        state: 'SENT',
        sentAt: new Date(),
        attempts: (delivery.attempts || 0) + 1,
      },
      { new: true }
    ).lean();
  }

  const providers = resolveDeliveryProviders();
  if (!providers.email.configured) {
    return NotificationDelivery.findByIdAndUpdate(
      deliveryId,
      {
        state: 'NOT_CONFIGURED',
        attempts: (delivery.attempts || 0) + 1,
      },
      { new: true }
    ).lean();
  }

  try {
    return NotificationDelivery.findByIdAndUpdate(
      deliveryId,
      {
        state: 'SENT',
        sentAt: new Date(),
        attempts: (delivery.attempts || 0) + 1,
      },
      { new: true }
    ).lean();
  } catch (err: any) {
    return NotificationDelivery.findByIdAndUpdate(
      deliveryId,
      {
        state: 'FAILED',
        failureReason: err?.message || 'delivery_failed',
        attempts: (delivery.attempts || 0) + 1,
      },
      { new: true }
    ).lean();
  }
}
