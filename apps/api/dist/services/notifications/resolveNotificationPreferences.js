"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveNotificationPreferences = resolveNotificationPreferences;
const NotificationPreference_1 = __importDefault(require("../../models/NotificationPreference"));
const notificationPolicies_1 = require("../../config/notifications/notificationPolicies");
async function resolveNotificationPreferences(input) {
    const pref = await NotificationPreference_1.default.findOne({ userId: input.userId }).lean();
    if (!pref) {
        return {
            ...notificationPolicies_1.DEFAULT_NOTIFICATION_POLICY,
            muted: false,
            effective: 'default',
            rawPreference: null,
        };
    }
    const muted = Array.isArray(pref.mutedTypes) && pref.mutedTypes.includes(input.type);
    return {
        emailEnabled: pref.emailEnabled,
        inAppEnabled: pref.inAppEnabled,
        digestEnabled: pref.digestEnabled,
        digestSchedule: pref.digestSchedule,
        mutedTypes: pref.mutedTypes || [],
        muted,
        effective: 'custom',
        rawPreference: pref,
    };
}
