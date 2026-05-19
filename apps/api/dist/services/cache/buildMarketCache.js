"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMarketCache = buildMarketCache;
exports.getMarketCache = getMarketCache;
const cachePolicies_1 = require("../../config/ingestion/cachePolicies");
const cacheStore = new Map();
function buildMarketCache(input) {
    const key = `${cachePolicies_1.CACHE_POLICIES.district.namespace}:${input.districtKey}`;
    const entry = {
        key,
        namespace: cachePolicies_1.CACHE_POLICIES.district.namespace,
        createdAt: new Date().toISOString(),
        ttlMinutes: cachePolicies_1.CACHE_POLICIES.district.ttlMinutes,
        payload: input.payload,
    };
    cacheStore.set(key, entry);
    return entry;
}
function getMarketCache(key) {
    return cacheStore.get(key) || null;
}
