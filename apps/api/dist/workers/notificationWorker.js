"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processQueuedNotifications = processQueuedNotifications;
const NotificationDelivery_1 = __importDefault(require("../models/NotificationDelivery"));
const processNotificationDelivery_1 = require("../services/notifications/processNotificationDelivery");
async function processQueuedNotifications(limit = 50) {
    const queued = await NotificationDelivery_1.default.find({ state: 'QUEUED' })
        .sort({ createdAt: 1 })
        .limit(limit)
        .lean();
    const results = [];
    for (const delivery of queued) {
        const processed = await (0, processNotificationDelivery_1.processNotificationDelivery)(String(delivery._id));
        results.push(processed);
    }
    return {
        processedCount: results.length,
        results,
    };
}
