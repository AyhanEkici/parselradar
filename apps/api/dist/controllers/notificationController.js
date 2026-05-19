"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotificationTestEvent = exports.getNotificationDigests = exports.archiveNotification = exports.markNotificationRead = exports.patchNotificationPreferences = exports.getNotificationPreferences = exports.getNotifications = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const NotificationPreference_1 = __importDefault(require("../models/NotificationPreference"));
const NotificationEvent_1 = __importDefault(require("../models/NotificationEvent"));
const NotificationDigest_1 = __importDefault(require("../models/NotificationDigest"));
const notificationPolicies_1 = require("../config/notifications/notificationPolicies");
const deliveryProviders_1 = require("../config/notifications/deliveryProviders");
const buildNotificationInbox_1 = require("../services/notifications/buildNotificationInbox");
const buildNotificationDigest_1 = require("../services/notifications/buildNotificationDigest");
const createNotificationEvent_1 = require("../services/notifications/createNotificationEvent");
const NotificationDelivery_1 = __importDefault(require("../models/NotificationDelivery"));
const processNotificationDelivery_1 = require("../services/notifications/processNotificationDelivery");
function requestUserId(req) {
    return new mongoose_1.default.Types.ObjectId(String(req.user?._id));
}
const getNotifications = async (req, res) => {
    const userId = requestUserId(req);
    const inbox = await (0, buildNotificationInbox_1.buildNotificationInbox)({ userId });
    return res.json(inbox);
};
exports.getNotifications = getNotifications;
const getNotificationPreferences = async (req, res) => {
    const userId = requestUserId(req);
    const pref = await NotificationPreference_1.default.findOne({ userId }).lean();
    const providers = (0, deliveryProviders_1.resolveDeliveryProviders)();
    return res.json({
        preferences: pref || {
            userId,
            ...notificationPolicies_1.DEFAULT_NOTIFICATION_POLICY,
        },
        supportedTypes: notificationPolicies_1.SUPPORTED_NOTIFICATION_TYPES,
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
exports.getNotificationPreferences = getNotificationPreferences;
const patchNotificationPreferences = async (req, res) => {
    const userId = requestUserId(req);
    const { emailEnabled, inAppEnabled, digestEnabled, digestSchedule, mutedTypes, } = req.body;
    const updated = await NotificationPreference_1.default.findOneAndUpdate({ userId }, {
        $set: {
            ...(typeof emailEnabled === 'boolean' ? { emailEnabled } : {}),
            ...(typeof inAppEnabled === 'boolean' ? { inAppEnabled } : {}),
            ...(typeof digestEnabled === 'boolean' ? { digestEnabled } : {}),
            ...(digestSchedule ? { digestSchedule } : {}),
            ...(Array.isArray(mutedTypes) ? { mutedTypes } : {}),
        },
        $setOnInsert: {
            userId,
            ...notificationPolicies_1.DEFAULT_NOTIFICATION_POLICY,
        },
    }, { new: true, upsert: true }).lean();
    return res.json(updated);
};
exports.patchNotificationPreferences = patchNotificationPreferences;
const markNotificationRead = async (req, res) => {
    const userId = requestUserId(req);
    const event = await NotificationEvent_1.default.findOneAndUpdate({ _id: req.params.id, userId }, { readAt: new Date() }, { new: true }).lean();
    if (!event)
        return res.status(404).json({ error: 'Notification bulunamadı' });
    return res.json(event);
};
exports.markNotificationRead = markNotificationRead;
const archiveNotification = async (req, res) => {
    const userId = requestUserId(req);
    const event = await NotificationEvent_1.default.findOneAndUpdate({ _id: req.params.id, userId }, { archivedAt: new Date() }, { new: true }).lean();
    if (!event)
        return res.status(404).json({ error: 'Notification bulunamadı' });
    return res.json(event);
};
exports.archiveNotification = archiveNotification;
const getNotificationDigests = async (req, res) => {
    const userId = requestUserId(req);
    const digests = await NotificationDigest_1.default.find({ userId }).sort({ createdAt: -1 }).limit(50).lean();
    if (digests.length > 0) {
        return res.json(digests);
    }
    const created = await (0, buildNotificationDigest_1.buildNotificationDigest)({ userId });
    return res.json([created]);
};
exports.getNotificationDigests = getNotificationDigests;
const createNotificationTestEvent = async (req, res) => {
    const userId = requestUserId(req);
    const type = (req.body?.type || 'opportunity_detected');
    if (!notificationPolicies_1.SUPPORTED_NOTIFICATION_TYPES.includes(type)) {
        return res.status(400).json({ error: 'Geçersiz notification type' });
    }
    const created = await (0, createNotificationEvent_1.createNotificationEvent)({
        userId,
        type,
        title: `Test event: ${type}`,
        message: `Controlled notification validation event for ${type}`,
        payload: {
            source: 'notifications/test-event',
            createdAt: new Date().toISOString(),
        },
    });
    const queued = await NotificationDelivery_1.default.find({ notificationEventId: created.event._id, state: 'QUEUED' }).lean();
    const processed = await Promise.all(queued.map((delivery) => (0, processNotificationDelivery_1.processNotificationDelivery)(String(delivery._id))));
    return res.json({
        event: created.event,
        deliveries: created.deliveries,
        processed,
    });
};
exports.createNotificationTestEvent = createNotificationTestEvent;
