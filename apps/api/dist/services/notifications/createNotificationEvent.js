"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotificationEvent = createNotificationEvent;
const NotificationEvent_1 = __importDefault(require("../../models/NotificationEvent"));
const resolveNotificationPreferences_1 = require("./resolveNotificationPreferences");
const queueNotificationDelivery_1 = require("./queueNotificationDelivery");
async function createNotificationEvent(input) {
    const preferences = await (0, resolveNotificationPreferences_1.resolveNotificationPreferences)({ userId: input.userId, type: input.type });
    const event = await NotificationEvent_1.default.create({
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        payload: input.payload || {},
    });
    const [inAppDelivery, emailDelivery] = await Promise.all([
        (0, queueNotificationDelivery_1.queueNotificationDelivery)({
            userId: input.userId,
            notificationEventId: event._id,
            channel: 'IN_APP',
            channelEnabled: preferences.inAppEnabled,
            muted: preferences.muted,
        }),
        (0, queueNotificationDelivery_1.queueNotificationDelivery)({
            userId: input.userId,
            notificationEventId: event._id,
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
