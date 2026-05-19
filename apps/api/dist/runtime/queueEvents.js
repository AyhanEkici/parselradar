"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerQueueEvents = registerQueueEvents;
exports.getQueueEventCounters = getQueueEventCounters;
exports.closeQueueEvents = closeQueueEvents;
const bullmq_1 = require("bullmq");
const redisClient_1 = require("../redis/redisClient");
const redisConfig_1 = require("../redis/redisConfig");
const queueEventsRegistry = new Map();
const queueCounters = new Map();
function getCounters(queueName) {
    const current = queueCounters.get(queueName);
    if (current)
        return current;
    const created = {
        completed: 0,
        failed: 0,
        retrying: 0,
        lastError: null,
    };
    queueCounters.set(queueName, created);
    return created;
}
async function registerQueueEvents(queueName) {
    if (queueEventsRegistry.has(queueName))
        return queueEventsRegistry.get(queueName) || null;
    const config = (0, redisConfig_1.getRedisConfig)();
    const redis = (0, redisClient_1.getRedisClient)();
    if (!config.enableDistributedRuntime || !redis)
        return null;
    const queueEvents = new bullmq_1.QueueEvents(queueName, {
        connection: redis,
        prefix: config.redisPrefix,
    });
    const counters = getCounters(queueName);
    queueEvents.on('completed', () => {
        counters.completed += 1;
    });
    queueEvents.on('failed', () => {
        counters.failed += 1;
        counters.retrying += 1;
    });
    queueEvents.on('error', (error) => {
        counters.lastError = error.message;
    });
    queueEventsRegistry.set(queueName, queueEvents);
    return queueEvents;
}
function getQueueEventCounters(queueName) {
    return getCounters(queueName);
}
async function closeQueueEvents() {
    for (const item of queueEventsRegistry.values()) {
        await item.close();
    }
    queueEventsRegistry.clear();
}
