"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.suppressNotification = suppressNotification;
const NotificationDelivery_1 = __importDefault(require("../../models/NotificationDelivery"));
async function suppressNotification(input) {
    return NotificationDelivery_1.default.findByIdAndUpdate(input.deliveryId, {
        state: 'SUPPRESSED',
        suppressReason: input.reason,
    }, { new: true }).lean();
}
