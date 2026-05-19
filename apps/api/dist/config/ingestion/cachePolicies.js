"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CACHE_POLICIES = void 0;
exports.CACHE_POLICIES = {
    district: {
        ttlMinutes: 180,
        namespace: 'district_cache',
    },
    comparable: {
        ttlMinutes: 120,
        namespace: 'comparable_cache',
    },
    spatial: {
        ttlMinutes: 240,
        namespace: 'spatial_cache',
    },
};
