import NotificationDelivery from '../../models/NotificationDelivery';

export async function suppressNotification(input: {
  deliveryId: string;
  reason: string;
}) {
  return NotificationDelivery.findByIdAndUpdate(
    input.deliveryId,
    {
      state: 'SUPPRESSED',
      suppressReason: input.reason,
    },
    { new: true }
  ).lean();
}
