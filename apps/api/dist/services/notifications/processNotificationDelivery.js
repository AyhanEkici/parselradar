"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processNotificationDelivery = processNotificationDelivery;
const NotificationDelivery_1 = __importDefault(require("../../models/NotificationDelivery"));
const deliveryProviders_1 = require("../../config/notifications/deliveryProviders");
async function processNotificationDelivery(deliveryId) {
    const delivery = await NotificationDelivery_1.default.findById(deliveryId).lean();
    if (!delivery)
        return null;
    if (delivery.state !== 'QUEUED') {
        return delivery;
    }
    if (delivery.channel === 'IN_APP') {
        return NotificationDelivery_1.default.findByIdAndUpdate(deliveryId, {
            state: 'SENT',
            sentAt: new Date(),
            attempts: (delivery.attempts || 0) + 1,
        }, { new: true }).lean();
    }
    const providers = (0, deliveryProviders_1.resolveDeliveryProviders)();
    if (!providers.email.configured) {
        return NotificationDelivery_1.default.findByIdAndUpdate(deliveryId, {
            state: 'NOT_CONFIGURED',
            attempts: (delivery.attempts || 0) + 1,
        }, { new: true }).lean();
    }
    try {
        return NotificationDelivery_1.default.findByIdAndUpdate(deliveryId, {
            state: 'SENT',
            sentAt: new Date(),
            attempts: (delivery.attempts || 0) + 1,
        }, { new: true }).lean();
    }
    catch (err) {
        return NotificationDelivery_1.default.findByIdAndUpdate(deliveryId, {
            state: 'FAILED',
            failureReason: err?.message || 'delivery_failed',
            attempts: (delivery.attempts || 0) + 1,
        }, { new: true }).lean();
    }
}
