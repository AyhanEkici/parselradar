"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisConfig = getRedisConfig;
function getRedisConfig() {
    const redisUrl = process.env.REDIS_URL || '';
    const redisTls = process.env.REDIS_TLS === '1' || process.env.REDIS_TLS === 'true';
    const redisPrefix = process.env.REDIS_PREFIX || 'parselradar';
    const enableDistributedRuntime = process.env.ENABLE_DISTRIBUTED_RUNTIME === '1' || process.env.ENABLE_DISTRIBUTED_RUNTIME === 'true';
    return {
        redisUrl,
        redisTls,
        redisPrefix,
        enableDistributedRuntime,
    };
}
