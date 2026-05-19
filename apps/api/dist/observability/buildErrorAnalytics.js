"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildErrorAnalytics = buildErrorAnalytics;
const NotificationDelivery_1 = __importDefault(require("../models/NotificationDelivery"));
const WorkspaceActivity_1 = __importDefault(require("../models/WorkspaceActivity"));
async function buildErrorAnalytics() {
    const [failedDeliveries, suppressedDeliveries, failedWorkspaceActions] = await Promise.all([
        NotificationDelivery_1.default.countDocuments({ state: 'FAILED' }),
        NotificationDelivery_1.default.countDocuments({ state: 'SUPPRESSED' }),
        WorkspaceActivity_1.default.countDocuments({ action: { $regex: 'failed', $options: 'i' } }),
    ]);
    const total = failedDeliveries + suppressedDeliveries + failedWorkspaceActions;
    return {
        errorState: total > 0 ? 'DEGRADED' : 'READY',
        failedDeliveries,
        suppressedDeliveries,
        failedWorkspaceActions,
        total,
    };
}
