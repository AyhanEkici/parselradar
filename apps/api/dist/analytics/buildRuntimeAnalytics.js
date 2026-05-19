"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRuntimeAnalytics = buildRuntimeAnalytics;
const buildOperationalSnapshot_1 = require("../monitoring/buildOperationalSnapshot");
async function buildRuntimeAnalytics() {
    const snapshot = await (0, buildOperationalSnapshot_1.buildOperationalSnapshot)();
    return {
        runtimeStatus: snapshot.runtimeStatus?.state || 'NOT_CONFIGURED',
        queueDepthTotal: snapshot.runtimeMetrics?.queueDepthTotal || 0,
        failureRatePercent: snapshot.runtimeMetrics?.failureRatePercent || 0,
        distributedRuntimeEnabled: Boolean(snapshot.distributedRuntimeEnabled),
        runtimeAnalyticsState: snapshot.runtimeStatus?.state && snapshot.runtimeStatus.state !== 'NOT_CONFIGURED'
            ? 'READY'
            : 'NOT_CONFIGURED',
    };
}
