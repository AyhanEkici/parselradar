"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REDIS_POLICIES = void 0;
exports.REDIS_POLICIES = {
    connectTimeoutMs: 2500,
    pingTimeoutMs: 2000,
    degradedLatencyMs: 180,
    failedLatencyMs: 1200,
    maxReconnectsBeforeDegraded: 5,
};
