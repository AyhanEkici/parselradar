"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildOperationalSnapshot = buildOperationalSnapshot;
const queueFactory_1 = require("../runtime/queueFactory");
const runtimeConfig_1 = require("../runtime/runtimeConfig");
const runtimeManager_1 = require("../runtime/runtimeManager");
const workerFactory_1 = require("../runtime/workerFactory");
const auditSecurityEvents_1 = require("../security/auditSecurityEvents");
const detectSuspiciousActivity_1 = require("../security/detectSuspiciousActivity");
const requestFingerprint_1 = require("../security/requestFingerprint");
const queueHealth_1 = require("./queueHealth");
const runtimeMetrics_1 = require("./runtimeMetrics");
const systemHealth_1 = require("./systemHealth");
async function buildOperationalSnapshot() {
    const manager = await (0, runtimeManager_1.buildRuntimeManagerSnapshot)();
    const runtimeConfig = (0, runtimeConfig_1.getRuntimeConfig)();
    const queueHealthSummary = (0, queueHealth_1.queueHealth)(manager.queueStates);
    const metrics = (0, runtimeMetrics_1.runtimeMetrics)(manager.queueStates, manager.workerStates);
    const queueMetrics = await Promise.all([
        (0, queueFactory_1.getQueueMetrics)('analysis').then((m) => ({ queue: 'analysis', ...m })),
        (0, queueFactory_1.getQueueMetrics)('market').then((m) => ({ queue: 'market', ...m })),
        (0, queueFactory_1.getQueueMetrics)('geo').then((m) => ({ queue: 'geo', ...m })),
        (0, queueFactory_1.getQueueMetrics)('alert').then((m) => ({ queue: 'alert', ...m })),
        (0, queueFactory_1.getQueueMetrics)('ingestion').then((m) => ({ queue: 'ingestion', ...m })),
    ]);
    const workerMetrics = [
        { worker: 'analysis', ...(0, workerFactory_1.getWorkerMetric)('analysis') },
        { worker: 'market', ...(0, workerFactory_1.getWorkerMetric)('market') },
        { worker: 'geo', ...(0, workerFactory_1.getWorkerMetric)('geo') },
        { worker: 'alert', ...(0, workerFactory_1.getWorkerMetric)('alert') },
        { worker: 'ingestion', ...(0, workerFactory_1.getWorkerMetric)('ingestion') },
    ];
    const securitySignals = (0, detectSuspiciousActivity_1.detectSuspiciousActivity)({
        rapidRequestCount: Number(process.env.RUNTIME_RAPID_REQUEST_COUNT || 0),
        distinctRoutes: Number(process.env.RUNTIME_DISTINCT_ROUTE_COUNT || 0),
        authFailures: Number(process.env.RUNTIME_AUTH_FAILURE_COUNT || 0),
        fingerprint: (0, requestFingerprint_1.requestFingerprint)({
            ip: process.env.RUNTIME_SAMPLE_IP || '127.0.0.1',
            method: 'GET',
            path: '/admin/runtime',
            userAgent: process.env.RUNTIME_SAMPLE_UA || 'runtime-monitor',
            userId: process.env.RUNTIME_SAMPLE_USER || 'system',
        }),
    });
    (0, auditSecurityEvents_1.auditSecurityEvents)('runtime_snapshot', securitySignals);
    const health = (0, systemHealth_1.systemHealth)({
        runtimeState: manager.runtimeStatus.state,
        queueFailed: queueHealthSummary.failed,
        workerFailed: manager.workerStates.filter((worker) => worker.state === 'FAILED').length,
        securitySignals,
    });
    const runtimeWarnings = [];
    if (manager.redisHealth.state === 'DEGRADED') {
        runtimeWarnings.push(manager.redisHealth.message);
    }
    if (queueHealthSummary.failed > 0) {
        runtimeWarnings.push(`Failed queues detected: ${queueHealthSummary.failed}`);
    }
    if (manager.workerStates.some((worker) => worker.state === 'DEGRADED')) {
        runtimeWarnings.push('One or more workers are degraded.');
    }
    if (queueMetrics.some((metric) => metric.backend === 'LOCAL_FALLBACK')) {
        runtimeWarnings.push('LOCAL_FALLBACK mode is active for at least one queue.');
    }
    return {
        runtimeStatus: manager.runtimeStatus,
        queueStates: manager.queueStates,
        workerStates: manager.workerStates,
        runtimeMetrics: metrics,
        redisStatus: manager.redisHealth.state,
        redisLatency: manager.redisHealth.redisLatency,
        queueMetrics,
        workerMetrics,
        throughput: {
            analysisPerHour: metrics.analysisThroughputPerHour,
            refreshPerHour: metrics.refreshThroughputPerHour,
        },
        runtimeWarnings,
        fallbackMode: queueMetrics.some((metric) => metric.backend === 'LOCAL_FALLBACK') ? 'LOCAL_FALLBACK' : 'NONE',
        distributedRuntimeEnabled: runtimeConfig.distributedRuntimeEnabled,
        operationalSnapshot: {
            generatedAt: new Date().toISOString(),
            degradedQueues: queueHealthSummary.degraded + queueHealthSummary.failed,
            degradedWorkers: manager.workerStates.filter((worker) => ['DEGRADED', 'FAILED'].includes(worker.state)).length,
            mode: manager.runtimeStatus.mode,
        },
        securitySignals: [
            ...securitySignals,
            ...(0, auditSecurityEvents_1.getSecurityAuditEvents)()
                .slice(0, 5)
                .map((record) => record.signal),
        ],
        healthSummary: {
            live: health.overall === 'FAILED' ? 'FAILED' : 'RUNNING',
            ready: ['RUNNING', 'READY'].includes(String(manager.runtimeStatus.state))
                ? 'READY'
                : manager.runtimeStatus.state,
            overall: health.overall,
            detail: health.detail,
        },
    };
}
