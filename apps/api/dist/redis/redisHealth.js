"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisHealth = getRedisHealth;
const redisPolicies_1 = require("../config/runtime/redisPolicies");
const redisClient_1 = require("./redisClient");
const redisConfig_1 = require("./redisConfig");
async function getRedisHealth() {
    const config = (0, redisConfig_1.getRedisConfig)();
    if (!config.enableDistributedRuntime) {
        return {
            state: 'DISABLED',
            redisStatus: 'DISABLED',
            redisLatency: null,
            reconnectCount: 0,
            connected: false,
            message: 'Distributed runtime is disabled by configuration.',
        };
    }
    if (!config.redisUrl) {
        return {
            state: 'NOT_CONFIGURED',
            redisStatus: 'NOT_CONFIGURED',
            redisLatency: null,
            reconnectCount: 0,
            connected: false,
            message: 'REDIS_URL is not configured.',
        };
    }
    const client = (0, redisClient_1.getRedisClient)();
    if (!client) {
        return {
            state: 'FAILED',
            redisStatus: 'FAILED',
            redisLatency: null,
            reconnectCount: (0, redisClient_1.getRedisRuntimeMeta)().reconnectCount,
            connected: false,
            message: 'Redis client initialization failed.',
        };
    }
    const startedAt = Date.now();
    try {
        const pingPromise = client.ping();
        const timeoutPromise = new Promise((_resolve, reject) => {
            setTimeout(() => reject(new Error('Redis ping timeout')), redisPolicies_1.REDIS_POLICIES.pingTimeoutMs);
        });
        await Promise.race([pingPromise, timeoutPromise]);
        const redisLatency = Date.now() - startedAt;
        const meta = (0, redisClient_1.getRedisRuntimeMeta)();
        let state = 'READY';
        let redisStatus = 'READY';
        let message = 'Redis is reachable.';
        if (redisLatency >= redisPolicies_1.REDIS_POLICIES.failedLatencyMs) {
            state = 'FAILED';
            redisStatus = 'FAILED';
            message = `Redis latency is critically high (${redisLatency}ms).`;
        }
        else if (redisLatency >= redisPolicies_1.REDIS_POLICIES.degradedLatencyMs ||
            meta.reconnectCount >= redisPolicies_1.REDIS_POLICIES.maxReconnectsBeforeDegraded) {
            state = 'DEGRADED';
            redisStatus = 'DEGRADED';
            message = `Redis is reachable but degraded (latency=${redisLatency}ms, reconnects=${meta.reconnectCount}).`;
        }
        return {
            state,
            redisStatus,
            redisLatency,
            reconnectCount: meta.reconnectCount,
            connected: true,
            message,
        };
    }
    catch (error) {
        return {
            state: 'FAILED',
            redisStatus: 'FAILED',
            redisLatency: null,
            reconnectCount: (0, redisClient_1.getRedisRuntimeMeta)().reconnectCount,
            connected: false,
            message: error?.message || 'Redis ping failed.',
        };
    }
}
