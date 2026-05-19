"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateQueue = getOrCreateQueue;
exports.markLocalQueued = markLocalQueued;
exports.markLocalCompleted = markLocalCompleted;
exports.markLocalFailed = markLocalFailed;
exports.getQueueMetrics = getQueueMetrics;
exports.closeQueues = closeQueues;
const bullmq_1 = require("bullmq");
const bullmqPolicies_1 = require("../config/runtime/bullmqPolicies");
const redisHealth_1 = require("../redis/redisHealth");
const redisClient_1 = require("../redis/redisClient");
const redisConfig_1 = require("../redis/redisConfig");
const queueEvents_1 = require("./queueEvents");
const queueRegistry = new Map();
const localQueueMetrics = new Map();
function getLocalMetrics(queueName) {
    const existing = localQueueMetrics.get(queueName);
    if (existing)
        return existing;
    const created = {
        pending: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
        retrying: 0,
    };
    localQueueMetrics.set(queueName, created);
    return created;
}
async function getOrCreateQueue(queueName) {
    const config = (0, redisConfig_1.getRedisConfig)();
    if (!config.enableDistributedRuntime) {
        return {
            queue: null,
            distributed: false,
            reason: 'Distributed runtime is disabled.',
        };
    }
    const health = await (0, redisHealth_1.getRedisHealth)();
    if (!health.connected || ['NOT_CONFIGURED', 'FAILED', 'DISABLED'].includes(health.state)) {
        return {
            queue: null,
            distributed: false,
            reason: `Redis unavailable for distributed queue: ${health.message}`,
        };
    }
    const existing = queueRegistry.get(queueName);
    if (existing) {
        return {
            queue: existing,
            distributed: true,
            reason: 'Distributed queue is ready.',
        };
    }
    const redis = (0, redisClient_1.getRedisClient)();
    if (!redis) {
        return {
            queue: null,
            distributed: false,
            reason: 'Redis client is not available.',
        };
    }
    try {
        const queue = new bullmq_1.Queue(bullmqPolicies_1.BULLMQ_POLICIES.queueNames[queueName], {
            connection: redis,
            prefix: config.redisPrefix,
        });
        queueRegistry.set(queueName, queue);
        await (0, queueEvents_1.registerQueueEvents)(bullmqPolicies_1.BULLMQ_POLICIES.queueNames[queueName]);
        return {
            queue,
            distributed: true,
            reason: 'Distributed queue created.',
        };
    }
    catch (error) {
        return {
            queue: null,
            distributed: false,
            reason: error?.message || 'Failed to create queue.',
        };
    }
}
function markLocalQueued(queueName) {
    const metrics = getLocalMetrics(queueName);
    metrics.pending += 1;
}
function markLocalCompleted(queueName) {
    const metrics = getLocalMetrics(queueName);
    metrics.pending = Math.max(0, metrics.pending - 1);
    metrics.completed += 1;
}
function markLocalFailed(queueName) {
    const metrics = getLocalMetrics(queueName);
    metrics.pending = Math.max(0, metrics.pending - 1);
    metrics.failed += 1;
    metrics.retrying += 1;
}
function toMetricsFromCounts(counts) {
    return {
        pending: counts.waiting || 0,
        active: counts.active || 0,
        completed: counts.completed || 0,
        failed: counts.failed || 0,
        delayed: counts.delayed || 0,
    };
}
async function getQueueMetrics(queueName) {
    const queue = queueRegistry.get(queueName);
    const fallback = getLocalMetrics(queueName);
    if (!queue) {
        return {
            ...fallback,
            retrying: fallback.retrying,
            backend: 'LOCAL_FALLBACK',
        };
    }
    try {
        const counts = await queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed');
        const counters = (0, queueEvents_1.getQueueEventCounters)(bullmqPolicies_1.BULLMQ_POLICIES.queueNames[queueName]);
        const normalized = toMetricsFromCounts(counts);
        return {
            ...normalized,
            retrying: counters.retrying,
            backend: 'DISTRIBUTED',
        };
    }
    catch {
        return {
            ...fallback,
            retrying: fallback.retrying,
            backend: 'LOCAL_FALLBACK',
        };
    }
}
async function closeQueues() {
    for (const queue of queueRegistry.values()) {
        await queue.close();
    }
    queueRegistry.clear();
}
