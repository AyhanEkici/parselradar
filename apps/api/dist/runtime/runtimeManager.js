"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRuntimeManagerSnapshot = buildRuntimeManagerSnapshot;
const runtimeThresholds_1 = require("../config/runtime/runtimeThresholds");
const redisHealth_1 = require("../redis/redisHealth");
const alertQueue_1 = require("../queues/alertQueue");
const analysisQueue_1 = require("../queues/analysisQueue");
const geoQueue_1 = require("../queues/geoQueue");
const ingestionQueue_1 = require("../queues/ingestionQueue");
const marketQueue_1 = require("../queues/marketQueue");
const runtimeConfig_1 = require("./runtimeConfig");
const workerFactory_1 = require("./workerFactory");
const analysisWorker_1 = require("../workers/analysisWorker");
const marketWorker_1 = require("../workers/marketWorker");
const geoWorker_1 = require("../workers/geoWorker");
const alertWorker_1 = require("../workers/alertWorker");
const ingestionWorker_1 = require("../workers/ingestionWorker");
async function buildRuntimeManagerSnapshot() {
    const config = (0, runtimeConfig_1.getRuntimeConfig)();
    const redisHealth = await (0, redisHealth_1.getRedisHealth)();
    if (config.workersEnabled && redisHealth.connected && redisHealth.state !== 'FAILED') {
        await Promise.all([
            (0, analysisWorker_1.ensureAnalysisWorker)(),
            (0, marketWorker_1.ensureMarketWorker)(),
            (0, geoWorker_1.ensureGeoWorker)(),
            (0, alertWorker_1.ensureAlertWorker)(),
            (0, ingestionWorker_1.ensureIngestionWorker)(),
        ]);
    }
    const queueStates = await Promise.all([
        (0, analysisQueue_1.getAnalysisQueueState)(),
        (0, marketQueue_1.getMarketQueueState)(),
        (0, geoQueue_1.getGeoQueueState)(),
        (0, alertQueue_1.getAlertQueueState)(),
        (0, ingestionQueue_1.getIngestionQueueState)(),
    ]);
    const workerStates = [
        (0, workerFactory_1.toWorkerState)('analysis', 'analysis'),
        (0, workerFactory_1.toWorkerState)('market', 'market'),
        (0, workerFactory_1.toWorkerState)('geo', 'geo'),
        (0, workerFactory_1.toWorkerState)('alert', 'alert'),
        (0, workerFactory_1.toWorkerState)('ingestion', 'ingestion'),
    ];
    const queueDegradedCount = queueStates.filter((q) => ['DEGRADED', 'FAILED'].includes(q.state)).length;
    const workerDegradedCount = workerStates.filter((w) => ['DEGRADED', 'FAILED'].includes(w.state)).length;
    const queueRatio = queueDegradedCount / Math.max(1, queueStates.length);
    const workerRatio = workerDegradedCount / Math.max(1, workerStates.length);
    let state = 'READY';
    let reason = 'Runtime is ready.';
    let mode = 'production-ready';
    if (!config.distributedRuntimeEnabled) {
        state = 'DISABLED';
        reason = 'Distributed runtime is disabled by configuration.';
        mode = 'standby';
    }
    else if (!config.redisConfigured) {
        state = 'NOT_CONFIGURED';
        reason = 'REDIS_URL is not configured for distributed runtime.';
        mode = 'standby';
    }
    else if (redisHealth.state === 'FAILED') {
        state = 'FAILED';
        reason = `Redis health failed: ${redisHealth.message}`;
        mode = 'degraded';
    }
    else if (queueStates.some((q) => q.state === 'FAILED') || workerStates.some((w) => w.state === 'FAILED')) {
        state = 'FAILED';
        reason = 'At least one queue or worker is failed.';
        mode = 'degraded';
    }
    else if (redisHealth.state === 'DEGRADED' ||
        queueRatio >= runtimeThresholds_1.RUNTIME_THRESHOLDS.degradedQueueRatio ||
        workerRatio >= runtimeThresholds_1.RUNTIME_THRESHOLDS.degradedWorkerRatio) {
        state = 'DEGRADED';
        reason = 'Runtime entered degraded mode due to Redis or queue worker thresholds.';
        mode = 'degraded';
    }
    else if (queueStates.some((q) => q.state === 'RUNNING') || workerStates.some((w) => w.state === 'RUNNING')) {
        state = 'RUNNING';
        reason = 'Runtime has active distributed execution.';
    }
    const runtimeStatus = {
        state,
        reason,
        mode,
        redisConfigured: config.redisConfigured,
        bullmqConfigured: config.bullmqEnabled,
        distributedRuntimeEnabled: config.distributedRuntimeEnabled,
        checkedAt: new Date().toISOString(),
    };
    return {
        runtimeStatus,
        queueStates,
        workerStates,
        redisHealth,
    };
}
