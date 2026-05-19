"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureWorker = ensureWorker;
exports.getWorkerMetric = getWorkerMetric;
exports.toWorkerState = toWorkerState;
exports.shutdownWorkers = shutdownWorkers;
const bullmq_1 = require("bullmq");
const workerConcurrency_1 = require("../config/runtime/workerConcurrency");
const redisHealth_1 = require("../redis/redisHealth");
const redisClient_1 = require("../redis/redisClient");
const redisConfig_1 = require("../redis/redisConfig");
const workerRegistry = new Map();
const workerMetrics = new Map();
function getMetric(name) {
    const existing = workerMetrics.get(name);
    if (existing)
        return existing;
    const created = {
        processed: 0,
        failed: 0,
        restarted: 0,
        lastStartedAt: null,
        running: false,
    };
    workerMetrics.set(name, created);
    return created;
}
function envConcurrency(name) {
    const raw = Number(process.env.WORKER_CONCURRENCY || workerConcurrency_1.WORKER_CONCURRENCY[name]);
    if (Number.isNaN(raw) || raw <= 0)
        return workerConcurrency_1.WORKER_CONCURRENCY[name];
    return raw;
}
async function ensureWorker(name, queueName, processor) {
    const config = (0, redisConfig_1.getRedisConfig)();
    const metric = getMetric(name);
    if (!config.enableDistributedRuntime) {
        metric.running = false;
        return { worker: null, distributed: false, reason: 'Distributed runtime disabled.' };
    }
    const health = await (0, redisHealth_1.getRedisHealth)();
    if (!health.connected || ['NOT_CONFIGURED', 'FAILED', 'DISABLED'].includes(health.state)) {
        metric.running = false;
        return { worker: null, distributed: false, reason: `Redis unavailable: ${health.message}` };
    }
    const existing = workerRegistry.get(name);
    if (existing) {
        metric.running = true;
        return { worker: existing, distributed: true, reason: 'Worker already running.' };
    }
    const redis = (0, redisClient_1.getRedisClient)();
    if (!redis) {
        metric.running = false;
        return { worker: null, distributed: false, reason: 'Redis client unavailable.' };
    }
    const worker = new bullmq_1.Worker(queueName, async (job) => processor(job), {
        connection: redis,
        prefix: config.redisPrefix,
        concurrency: envConcurrency(name),
    });
    worker.on('completed', () => {
        metric.processed += 1;
    });
    worker.on('failed', () => {
        metric.failed += 1;
    });
    worker.on('error', () => {
        metric.restarted += 1;
    });
    metric.running = true;
    metric.lastStartedAt = new Date().toISOString();
    workerRegistry.set(name, worker);
    return { worker, distributed: true, reason: 'Worker started.' };
}
function getWorkerMetric(name) {
    return getMetric(name);
}
function toWorkerState(name, queueName) {
    const config = (0, redisConfig_1.getRedisConfig)();
    const metric = getMetric(name);
    const concurrency = envConcurrency(name);
    let state = 'READY';
    let reason = 'Worker initialized.';
    if (!config.enableDistributedRuntime) {
        state = 'DISABLED';
        reason = 'Distributed runtime is disabled.';
    }
    else if (!config.redisUrl) {
        state = 'NOT_CONFIGURED';
        reason = 'REDIS_URL is not configured.';
    }
    else if (metric.failed > metric.processed + 5) {
        state = 'FAILED';
        reason = 'Worker failures exceed safe threshold.';
    }
    else if (metric.restarted > 2) {
        state = 'DEGRADED';
        reason = 'Worker restart count indicates degraded runtime.';
    }
    else if (metric.running) {
        state = 'RUNNING';
        reason = 'Worker is running with distributed runtime.';
    }
    return {
        name,
        queueName,
        state,
        reason,
        concurrency,
        checkedAt: new Date().toISOString(),
    };
}
async function shutdownWorkers() {
    for (const worker of workerRegistry.values()) {
        await worker.close();
    }
    workerRegistry.clear();
    for (const metric of workerMetrics.values()) {
        metric.running = false;
    }
}
