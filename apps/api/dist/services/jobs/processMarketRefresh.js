"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processMarketRefresh = processMarketRefresh;
function processMarketRefresh(input) {
    const needsRefresh = input.staleFlags.includes('market_stale') || input.staleFlags.includes('analysis_stale');
    return {
        propertyId: input.propertyId,
        refreshStatus: needsRefresh ? 'refreshing' : 'fresh',
        refreshReason: needsRefresh ? 'market_refresh' : 'market_current',
        completedAt: needsRefresh ? new Date().toISOString() : input.lastMarketRefresh || null,
    };
}
