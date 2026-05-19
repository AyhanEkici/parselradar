"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processSpatialRefresh = processSpatialRefresh;
function processSpatialRefresh(input) {
    const needsRefresh = input.staleFlags.includes('spatial_stale');
    return {
        propertyId: input.propertyId,
        refreshStatus: needsRefresh ? 'refreshing' : 'fresh',
        refreshReason: needsRefresh ? 'spatial_refresh' : 'spatial_current',
        completedAt: needsRefresh ? new Date().toISOString() : input.lastSpatialRefresh || null,
    };
}
