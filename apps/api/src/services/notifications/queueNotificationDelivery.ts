import mongoose from 'mongoose';
import NotificationDelivery from '../../models/NotificationDelivery';
import { resolveDeliveryProviders } from '../../config/notifications/deliveryProviders';

export async function queueNotificationDelivery(input: {
  userId: mongoose.Types.ObjectId;
  notificationEventId: mongoose.Types.ObjectId;
  channel: 'IN_APP' | 'EMAIL';
  channelEnabled: boolean;
  muted: boolean;
}) {
  const providers = resolveDeliveryProviders();

  let state: 'NOT_CONFIGURED' | 'DISABLED' | 'QUEUED' | 'SUPPRESSED' = 'QUEUED';
  let provider: 'none' | 'stub-email' = 'none';
  let suppressReason: string | undefined;

  if (input.muted) {
    state = 'SUPPRESSED';
    suppressReason = 'muted_by_preference';
  } else if (!input.channelEnabled) {
    state = 'DISABLED';
  } else if (input.channel === 'EMAIL') {
    if (!providers.email.configured) {
      state = 'NOT_CONFIGURED';
      provider = 'none';
    } else {
      state = 'QUEUED';
      provider = 'stub-email';
    }
  } else {
    state = 'QUEUED';
    provider = 'none';
  }

  const now = new Date();

  const delivery = await NotificationDelivery.findOneAndUpdate(
    {
      userId: input.userId,
      notificationEventId: input.notificationEventId,
      channel: input.channel,
    },
    {
      $set: {
        provider,
        state,
        suppressReason,
        queuedAt: state === 'QUEUED' ? now : undefined,
      },
      $setOnInsert: {
        userId: input.userId,
        notificationEventId: input.notificationEventId,
        channel: input.channel,
      },
    },
    { new: true, upsert: true }
  ).lean();

  return delivery;
}
