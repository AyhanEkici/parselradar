"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleAnalysisRefresh = scheduleAnalysisRefresh;
const ingestionThresholds_1 = require("../../config/ingestion/ingestionThresholds");
function hoursSince(date) {
    if (!date)
        return Number.POSITIVE_INFINITY;
    const value = new Date(date).getTime();
    if (Number.isNaN(value))
        return Number.POSITIVE_INFINITY;
    return (Date.now() - value) / (1000 * 60 * 60);
}
function scheduleAnalysisRefresh(input) {
    const staleFlags = [];
    if (hoursSince(input.lastAnalysisAt) > ingestionThresholds_1.INGESTION_THRESHOLDS.staleHours.analysis)
        staleFlags.push('analysis_stale');
    if (hoursSince(input.lastSpatialRefresh) > ingestionThresholds_1.INGESTION_THRESHOLDS.staleHours.spatial)
        staleFlags.push('spatial_stale');
    if (hoursSince(input.lastMarketRefresh) > ingestionThresholds_1.INGESTION_THRESHOLDS.staleHours.market)
        staleFlags.push('market_stale');
    return {
        propertyId: input.propertyId,
        refreshStatus: staleFlags.length > 0 ? 'queued' : 'fresh',
        staleFlags,
        refreshReason: staleFlags[0] || 'scheduled_review',
    };
}
