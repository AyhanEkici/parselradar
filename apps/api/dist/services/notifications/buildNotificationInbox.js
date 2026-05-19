"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildNotificationInbox = buildNotificationInbox;
const NotificationEvent_1 = __importDefault(require("../../models/NotificationEvent"));
const NotificationDelivery_1 = __importDefault(require("../../models/NotificationDelivery"));
async function buildNotificationInbox(input) {
    const events = await NotificationEvent_1.default.find({ userId: input.userId, archivedAt: { $exists: false } })
        .sort({ createdAt: -1 })
        .limit(200)
        .lean();
    const deliveries = await NotificationDelivery_1.default.find({
        userId: input.userId,
        notificationEventId: { $in: events.map((e) => e._id) },
    }).lean();
    const byEvent = {};
    deliveries.forEach((delivery) => {
        const key = String(delivery.notificationEventId);
        if (!byEvent[key])
            byEvent[key] = [];
        byEvent[key].push(delivery);
    });
    return {
        unreadCount: events.filter((event) => !event.readAt).length,
        archivedCount: 0,
        events: events.map((event) => ({
            ...event,
            deliveries: byEvent[String(event._id)] || [],
        })),
    };
}
