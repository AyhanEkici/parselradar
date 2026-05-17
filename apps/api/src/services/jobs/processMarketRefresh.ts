export function processMarketRefresh(input: { propertyId: string; staleFlags: string[]; lastMarketRefresh?: string | Date | null }) {
  const needsRefresh = input.staleFlags.includes('market_stale') || input.staleFlags.includes('analysis_stale');
  return {
    propertyId: input.propertyId,
    refreshStatus: needsRefresh ? 'refreshing' : 'fresh',
    refreshReason: needsRefresh ? 'market_refresh' : 'market_current',
    completedAt: needsRefresh ? new Date().toISOString() : input.lastMarketRefresh || null,
  };
}
