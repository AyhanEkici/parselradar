"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueNotificationDelivery = queueNotificationDelivery;
const NotificationDelivery_1 = __importDefault(require("../../models/NotificationDelivery"));
const deliveryProviders_1 = require("../../config/notifications/deliveryProviders");
async function queueNotificationDelivery(input) {
    const providers = (0, deliveryProviders_1.resolveDeliveryProviders)();
    let state = 'QUEUED';
    let provider = 'none';
    let suppressReason;
    if (input.muted) {
        state = 'SUPPRESSED';
        suppressReason = 'muted_by_preference';
    }
    else if (!input.channelEnabled) {
        state = 'DISABLED';
    }
    else if (input.channel === 'EMAIL') {
        if (!providers.email.configured) {
            state = 'NOT_CONFIGURED';
            provider = 'none';
        }
        else {
            state = 'QUEUED';
            provider = 'stub-email';
        }
    }
    else {
        state = 'QUEUED';
        provider = 'none';
    }
    const now = new Date();
    const delivery = await NotificationDelivery_1.default.findOneAndUpdate({
        userId: input.userId,
        notificationEventId: input.notificationEventId,
        channel: input.channel,
    }, {
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
    }, { new: true, upsert: true }).lean();
    return delivery;
}
