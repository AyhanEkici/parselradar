"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const NotificationDeliverySchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    notificationEventId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'NotificationEvent', required: true, index: true },
    channel: { type: String, enum: ['IN_APP', 'EMAIL'], required: true, index: true },
    provider: { type: String, enum: ['none', 'stub-email'], default: 'none' },
    state: {
        type: String,
        enum: ['NOT_CONFIGURED', 'DISABLED', 'QUEUED', 'SENT', 'FAILED', 'SUPPRESSED'],
        required: true,
        index: true,
    },
    suppressReason: { type: String },
    failureReason: { type: String },
    attempts: { type: Number, default: 0 },
    queuedAt: { type: Date },
    sentAt: { type: Date },
}, { timestamps: true });
NotificationDeliverySchema.index({ userId: 1, notificationEventId: 1, channel: 1 }, { unique: true });
exports.default = mongoose_1.default.model('NotificationDelivery', NotificationDeliverySchema);
