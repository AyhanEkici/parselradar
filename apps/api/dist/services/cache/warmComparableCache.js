"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.warmComparableCache = warmComparableCache;
exports.getComparableCache = getComparableCache;
const cachePolicies_1 = require("../../config/ingestion/cachePolicies");
const comparableCache = new Map();
function warmComparableCache(input) {
    const key = `${cachePolicies_1.CACHE_POLICIES.comparable.namespace}:${input.districtKey}`;
    const entry = {
        key,
        namespace: cachePolicies_1.CACHE_POLICIES.comparable.namespace,
        cachedAt: new Date().toISOString(),
        ttlMinutes: cachePolicies_1.CACHE_POLICIES.comparable.ttlMinutes,
        comparableCount: input.comparableCount,
    };
    comparableCache.set(key, entry);
    return entry;
}
function getComparableCache(key) {
    return comparableCache.get(key) || null;
}
