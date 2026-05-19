"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runtimeMetrics = runtimeMetrics;
const runtimeThresholds_1 = require("../config/runtime/runtimeThresholds");
function runtimeMetrics(queueStates, workerStates) {
    const queueDepthTotal = queueStates.reduce((sum, q) => sum + q.depth, 0);
    const failureTotal = queueStates.reduce((sum, q) => sum + q.failures, 0);
    const retryTotal = queueStates.reduce((sum, q) => sum + q.retries, 0);
    const failureRatePercent = retryTotal + failureTotal === 0 ? 0 : Number(((failureTotal / (retryTotal + failureTotal)) * 100).toFixed(2));
    const runningWorkers = workerStates.filter((w) => w.state === 'RUNNING').length;
    const analysisThroughputPerHour = Math.max(0, runningWorkers * 6 - Math.floor(queueDepthTotal / 20));
    const refreshThroughputPerHour = Math.max(0, runningWorkers * 5 - Math.floor(queueDepthTotal / 24));
    return {
        queueDepthTotal,
        failureRatePercent,
        analysisThroughputPerHour,
        refreshThroughputPerHour,
        staleAnalysisCount: Math.max(0, queueDepthTotal - runtimeThresholds_1.RUNTIME_THRESHOLDS.queueDepthWarning),
        staleRefreshCount: Math.max(0, Math.floor(queueDepthTotal / 2) - runtimeThresholds_1.RUNTIME_THRESHOLDS.queueDepthWarning),
    };
}
