import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import NotificationPreference, { NotificationType } from '../models/NotificationPreference';
import NotificationEvent from '../models/NotificationEvent';
import NotificationDigest from '../models/NotificationDigest';
import { DEFAULT_NOTIFICATION_POLICY, SUPPORTED_NOTIFICATION_TYPES } from '../config/notifications/notificationPolicies';
import { resolveDeliveryProviders } from '../config/notifications/deliveryProviders';
import { buildNotificationInbox } from '../services/notifications/buildNotificationInbox';
import { buildNotificationDigest } from '../services/notifications/buildNotificationDigest';
import { createNotificationEvent } from '../services/notifications/createNotificationEvent';
import NotificationDelivery from '../models/NotificationDelivery';
import { processNotificationDelivery } from '../services/notifications/processNotificationDelivery';
import { notificationOwnerScope } from '../utils/scopeFilters';

function requestUserId(req: AuthRequest) {
  return new mongoose.Types.ObjectId(String(req.user?._id));
}

export const getNotifications = async (req: AuthRequest, res: Response) => {
  const userId = requestUserId(req);
  const inbox = await buildNotificationInbox({ userId });
  return res.json(inbox);
};

export const getNotificationPreferences = async (req: AuthRequest, res: Response) => {
  const userId = requestUserId(req);
  const pref = await NotificationPreference.findOne(notificationOwnerScope(req.user, {})).lean();
  const providers = resolveDeliveryProviders();

  return res.json({
    preferences: pref || {
      userId,
      ...DEFAULT_NOTIFICATION_POLICY,
    },
    supportedTypes: SUPPORTED_NOTIFICATION_TYPES,
    channelStatus: {
      inApp: { configured: true, state: 'SENT' },
      email: {
        configured: providers.email.configured,
        provider: providers.email.providerName,
        state: providers.email.configured ? 'DISABLED' : 'NOT_CONFIGURED',
      },
    },
  });
};

export const patchNotificationPreferences = async (req: AuthRequest, res: Response) => {
  const userId = requestUserId(req);
  const {
    emailEnabled,
    inAppEnabled,
    digestEnabled,
    digestSchedule,
    mutedTypes,
  } = req.body as {
    emailEnabled?: boolean;
    inAppEnabled?: boolean;
    digestEnabled?: boolean;
    digestSchedule?: 'daily' | 'weekly' | 'off';
    mutedTypes?: NotificationType[];
  };

  const updated = await NotificationPreference.findOneAndUpdate(
    notificationOwnerScope(req.user, {}),
    {
      $set: {
        ...(typeof emailEnabled === 'boolean' ? { emailEnabled } : {}),
        ...(typeof inAppEnabled === 'boolean' ? { inAppEnabled } : {}),
        ...(typeof digestEnabled === 'boolean' ? { digestEnabled } : {}),
        ...(digestSchedule ? { digestSchedule } : {}),
        ...(Array.isArray(mutedTypes) ? { mutedTypes } : {}),
      },
      $setOnInsert: {
        userId,
        ...DEFAULT_NOTIFICATION_POLICY,
      },
    },
    { new: true, upsert: true }
  ).lean();

  return res.json(updated);
};

export const markNotificationRead = async (req: AuthRequest, res: Response) => {
  const userId = requestUserId(req);
  const event = await NotificationEvent.findOneAndUpdate(
    notificationOwnerScope(req.user, { _id: req.params.id }),
    { readAt: new Date() },
    { new: true }
  ).lean();

  if (!event) return res.status(404).json({ error: 'Notification bulunamadı' });
  return res.json(event);
};

export const archiveNotification = async (req: AuthRequest, res: Response) => {
  const userId = requestUserId(req);
  const event = await NotificationEvent.findOneAndUpdate(
    notificationOwnerScope(req.user, { _id: req.params.id }),
    { archivedAt: new Date() },
    { new: true }
  ).lean();

  if (!event) return res.status(404).json({ error: 'Notification bulunamadı' });
  return res.json(event);
};

export const getNotificationDigests = async (req: AuthRequest, res: Response) => {
  const userId = requestUserId(req);
  const digests = await NotificationDigest.find(notificationOwnerScope(req.user, {})).sort({ createdAt: -1 }).limit(50).lean();

  if (digests.length > 0) {
    return res.json(digests);
  }

  const created = await buildNotificationDigest({ userId });
  return res.json([created]);
};

export const createNotificationTestEvent = async (req: AuthRequest, res: Response) => {
  const userId = requestUserId(req);
  const type = (req.body?.type || 'opportunity_detected') as NotificationType;

  if (!SUPPORTED_NOTIFICATION_TYPES.includes(type)) {
    return res.status(400).json({ error: 'Geçersiz notification type' });
  }

  const created = await createNotificationEvent({
    userId,
    type,
    title: `Test event: ${type}`,
    message: `Controlled notification validation event for ${type}`,
    payload: {
      source: 'notifications/test-event',
      createdAt: new Date().toISOString(),
    },
  });

  const queued = await NotificationDelivery.find({ notificationEventId: created.event._id, state: 'QUEUED' }).lean();
  const processed = await Promise.all(queued.map((delivery: any) => processNotificationDelivery(String(delivery._id))));

  return res.json({
    event: created.event,
    deliveries: created.deliveries,
    processed,
  });
};
