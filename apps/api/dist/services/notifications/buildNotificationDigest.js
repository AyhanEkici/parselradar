"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildNotificationDigest = buildNotificationDigest;
const NotificationDigest_1 = __importDefault(require("../../models/NotificationDigest"));
const NotificationEvent_1 = __importDefault(require("../../models/NotificationEvent"));
const NotificationPreference_1 = __importDefault(require("../../models/NotificationPreference"));
const deliveryProviders_1 = require("../../config/notifications/deliveryProviders");
async function buildNotificationDigest(input) {
    const [pref, events] = await Promise.all([
        NotificationPreference_1.default.findOne({ userId: input.userId }).lean(),
        NotificationEvent_1.default.find({ userId: input.userId, archivedAt: { $exists: false } })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean(),
    ]);
    if (pref && (!pref.digestEnabled || pref.digestSchedule === 'off')) {
        const digest = await NotificationDigest_1.default.create({
            userId: input.userId,
            schedule: 'daily',
            itemCount: 0,
            notificationEventIds: [],
            deliveryState: 'DISABLED',
        });
        return digest;
    }
    const schedule = (pref?.digestSchedule === 'weekly' ? 'weekly' : 'daily');
    const provider = (0, deliveryProviders_1.resolveDeliveryProviders)();
    const state = provider.email.configured ? 'QUEUED' : 'NOT_CONFIGURED';
    const digest = await NotificationDigest_1.default.create({
        userId: input.userId,
        schedule,
        itemCount: events.length,
        notificationEventIds: events.map((e) => e._id),
        deliveryState: state,
    });
    return digest;
}
