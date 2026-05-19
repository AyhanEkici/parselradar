"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisClient = getRedisClient;
exports.getRedisRuntimeMeta = getRedisRuntimeMeta;
exports.closeRedisClient = closeRedisClient;
const ioredis_1 = __importDefault(require("ioredis"));
const redisPolicies_1 = require("../config/runtime/redisPolicies");
const redisConfig_1 = require("./redisConfig");
const runtimeState = {
    client: null,
    reconnectCount: 0,
    lastError: null,
    connectedAt: null,
};
function buildRedisClient() {
    const config = (0, redisConfig_1.getRedisConfig)();
    if (!config.redisUrl)
        return null;
    const client = new ioredis_1.default(config.redisUrl, {
        maxRetriesPerRequest: 1,
        connectTimeout: redisPolicies_1.REDIS_POLICIES.connectTimeoutMs,
        enableReadyCheck: true,
        tls: config.redisTls ? {} : undefined,
    });
    client.on('reconnecting', () => {
        runtimeState.reconnectCount += 1;
    });
    client.on('error', (error) => {
        runtimeState.lastError = error.message;
    });
    client.on('ready', () => {
        runtimeState.connectedAt = new Date().toISOString();
        runtimeState.lastError = null;
    });
    return client;
}
function getRedisClient() {
    if (runtimeState.client)
        return runtimeState.client;
    runtimeState.client = buildRedisClient();
    return runtimeState.client;
}
function getRedisRuntimeMeta() {
    return {
        reconnectCount: runtimeState.reconnectCount,
        lastError: runtimeState.lastError,
        connectedAt: runtimeState.connectedAt,
    };
}
async function closeRedisClient() {
    if (runtimeState.client) {
        await runtimeState.client.quit();
        runtimeState.client = null;
        runtimeState.connectedAt = null;
    }
}
