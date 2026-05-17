import mongoose from 'mongoose';
import NotificationDigest from '../../models/NotificationDigest';
import NotificationEvent from '../../models/NotificationEvent';
import NotificationPreference from '../../models/NotificationPreference';
import { resolveDeliveryProviders } from '../../config/notifications/deliveryProviders';

export async function buildNotificationDigest(input: {
  userId: mongoose.Types.ObjectId;
}) {
  const [pref, events] = await Promise.all([
    NotificationPreference.findOne({ userId: input.userId }).lean(),
    NotificationEvent.find({ userId: input.userId, archivedAt: { $exists: false } })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(),
  ]);

  if (pref && (!pref.digestEnabled || pref.digestSchedule === 'off')) {
    const digest = await NotificationDigest.create({
      userId: input.userId,
      schedule: 'daily',
      itemCount: 0,
      notificationEventIds: [],
      deliveryState: 'DISABLED',
    });
    return digest;
  }

  const schedule = (pref?.digestSchedule === 'weekly' ? 'weekly' : 'daily') as 'daily' | 'weekly';
  const provider = resolveDeliveryProviders();
  const state = provider.email.configured ? 'QUEUED' : 'NOT_CONFIGURED';

  const digest = await NotificationDigest.create({
    userId: input.userId,
    schedule,
    itemCount: events.length,
    notificationEventIds: events.map((e: any) => e._id),
    deliveryState: state,
  });

  return digest;
}
