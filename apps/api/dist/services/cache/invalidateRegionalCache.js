"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateRegionalCache = invalidateRegionalCache;
exports.isRegionalCacheInvalidated = isRegionalCacheInvalidated;
const cachePolicies_1 = require("../../config/ingestion/cachePolicies");
const buildMarketCache_1 = require("./buildMarketCache");
const invalidatedKeys = new Set();
function invalidateRegionalCache(input) {
    const key = `${cachePolicies_1.CACHE_POLICIES.district.namespace}:${input.districtKey}`;
    const hadEntry = Boolean((0, buildMarketCache_1.getMarketCache)(key));
    invalidatedKeys.add(key);
    return {
        key,
        invalidated: hadEntry,
        invalidatedAt: new Date().toISOString(),
    };
}
function isRegionalCacheInvalidated(key) {
    return invalidatedKeys.has(key);
}
