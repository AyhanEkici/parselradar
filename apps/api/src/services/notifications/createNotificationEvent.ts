import mongoose from 'mongoose';
import NotificationEvent from '../../models/NotificationEvent';
import { NotificationType } from '../../models/NotificationPreference';
import { resolveNotificationPreferences } from './resolveNotificationPreferences';
import { queueNotificationDelivery } from './queueNotificationDelivery';

export async function createNotificationEvent(input: {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  payload?: Record<string, unknown>;
}) {
  const preferences = await resolveNotificationPreferences({ userId: input.userId, type: input.type });

  const event = await NotificationEvent.create({
    userId: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    payload: input.payload || {},
  });

  const [inAppDelivery, emailDelivery] = await Promise.all([
    queueNotificationDelivery({
      userId: input.userId,
      notificationEventId: event._id as mongoose.Types.ObjectId,
      channel: 'IN_APP',
      channelEnabled: preferences.inAppEnabled,
      muted: preferences.muted,
    }),
    queueNotificationDelivery({
      userId: input.userId,
      notificationEventId: event._id as mongoose.Types.ObjectId,
      channel: 'EMAIL',
      channelEnabled: preferences.emailEnabled,
      muted: preferences.muted,
    }),
  ]);

  return {
    event,
    deliveries: {
      inApp: inAppDelivery,
      email: emailDelivery,
    },
    preferences,
  };
}
