"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enqueueRuntimeJob = enqueueRuntimeJob;
exports.getRuntimeQueueState = getRuntimeQueueState;
const runtimeConfig_1 = require("../runtime/runtimeConfig");
const retryPolicies_1 = require("../runtime/retryPolicies");
const queueFactory_1 = require("../runtime/queueFactory");
async function enqueueRuntimeJob(queueName, jobName, payload) {
    const config = (0, runtimeConfig_1.getRuntimeConfig)();
    if (!config.queuesEnabled) {
        return { accepted: false, reason: 'queues_disabled', mode: 'DISABLED' };
    }
    const queueResult = await (0, queueFactory_1.getOrCreateQueue)(queueName);
    if (!queueResult.queue || !queueResult.distributed) {
        (0, queueFactory_1.markLocalQueued)(queueName);
        (0, queueFactory_1.markLocalCompleted)(queueName);
        return {
            accepted: true,
            reason: queueResult.reason,
            mode: 'LOCAL_FALLBACK',
            distributedRuntimeEnabled: config.distributedRuntimeEnabled,
        };
    }
    try {
        await queueResult.queue.add(jobName, payload, (0, retryPolicies_1.buildRetryPolicy)(queueName));
        return {
            accepted: true,
            reason: 'Job queued in distributed runtime.',
            mode: 'DISTRIBUTED',
            distributedRuntimeEnabled: config.distributedRuntimeEnabled,
        };
    }
    catch (error) {
        (0, queueFactory_1.markLocalQueued)(queueName);
        (0, queueFactory_1.markLocalFailed)(queueName);
        return {
            accepted: false,
            reason: error?.message || 'Failed to queue distributed job.',
            mode: 'LOCAL_FALLBACK',
            distributedRuntimeEnabled: config.distributedRuntimeEnabled,
        };
    }
}
async function getRuntimeQueueState(queueName, deadLetterReady) {
    const config = (0, runtimeConfig_1.getRuntimeConfig)();
    const queueResult = await (0, queueFactory_1.getOrCreateQueue)(queueName);
    const metrics = await (0, queueFactory_1.getQueueMetrics)(queueName);
    let state = 'READY';
    let reason = queueResult.reason;
    if (!config.distributedRuntimeEnabled) {
        state = 'DISABLED';
        reason = 'Distributed runtime is disabled by configuration.';
    }
    else if (!config.redisConfigured) {
        state = 'NOT_CONFIGURED';
        reason = 'REDIS_URL is not configured.';
    }
    else if (metrics.backend === 'LOCAL_FALLBACK') {
        state = 'DEGRADED';
        reason = `LOCAL_FALLBACK: ${queueResult.reason}`;
    }
    else if (metrics.failed > 0 && metrics.failed >= metrics.completed + 10) {
        state = 'FAILED';
        reason = 'Queue failure count exceeds safe threshold.';
    }
    else if (metrics.active > 0 || metrics.pending > 0) {
        state = 'RUNNING';
        reason = 'Queue has active distributed jobs.';
    }
    return {
        name: queueName,
        state,
        reason,
        backend: metrics.backend === 'DISTRIBUTED' ? 'redis-bullmq' : 'local-fallback',
        depth: metrics.pending + metrics.active + metrics.delayed,
        retries: metrics.retrying,
        failures: metrics.failed,
        deadLetterReady,
        checkedAt: new Date().toISOString(),
    };
}
