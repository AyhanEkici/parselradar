import mongoose from 'mongoose';
import NotificationPreference from '../../models/NotificationPreference';
import { NotificationType } from '../../models/NotificationPreference';
import { DEFAULT_NOTIFICATION_POLICY } from '../../config/notifications/notificationPolicies';

export async function resolveNotificationPreferences(input: {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
}) {
  const pref = await NotificationPreference.findOne({ userId: input.userId }).lean();

  if (!pref) {
    return {
      ...DEFAULT_NOTIFICATION_POLICY,
      muted: false,
      effective: 'default',
      rawPreference: null,
    };
  }

  const muted = Array.isArray(pref.mutedTypes) && pref.mutedTypes.includes(input.type);

  return {
    emailEnabled: pref.emailEnabled,
    inAppEnabled: pref.inAppEnabled,
    digestEnabled: pref.digestEnabled,
    digestSchedule: pref.digestSchedule,
    mutedTypes: pref.mutedTypes || [],
    muted,
    effective: 'custom',
    rawPreference: pref,
  };
}
