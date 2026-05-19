"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_NOTIFICATION_POLICY = exports.SUPPORTED_NOTIFICATION_TYPES = void 0;
exports.SUPPORTED_NOTIFICATION_TYPES = [
    'opportunity_detected',
    'market_shift',
    'infrastructure_signal',
    'stale_analysis',
    'connector_failed',
    'portfolio_risk',
    'workspace_activity',
];
exports.DEFAULT_NOTIFICATION_POLICY = {
    emailEnabled: false,
    inAppEnabled: true,
    digestEnabled: true,
    digestSchedule: 'daily',
    mutedTypes: [],
};
