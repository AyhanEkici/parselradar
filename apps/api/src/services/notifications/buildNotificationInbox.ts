import mongoose from 'mongoose';
import NotificationEvent from '../../models/NotificationEvent';
import NotificationDelivery from '../../models/NotificationDelivery';

export async function buildNotificationInbox(input: {
  userId: mongoose.Types.ObjectId;
}) {
  const events = await NotificationEvent.find({ userId: input.userId, archivedAt: { $exists: false } })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  const deliveries = await NotificationDelivery.find({
    userId: input.userId,
    notificationEventId: { $in: events.map((e: any) => e._id) },
  }).lean();

  const byEvent: Record<string, any[]> = {};
  deliveries.forEach((delivery: any) => {
    const key = String(delivery.notificationEventId);
    if (!byEvent[key]) byEvent[key] = [];
    byEvent[key].push(delivery);
  });

  return {
    unreadCount: events.filter((event: any) => !event.readAt).length,
    archivedCount: 0,
    events: events.map((event: any) => ({
      ...event,
      deliveries: byEvent[String(event._id)] || [],
    })),
  };
}
