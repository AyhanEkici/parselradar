export function processSpatialRefresh(input: { propertyId: string; staleFlags: string[]; lastSpatialRefresh?: string | Date | null }) {
  const needsRefresh = input.staleFlags.includes('spatial_stale');
  return {
    propertyId: input.propertyId,
    refreshStatus: needsRefresh ? 'refreshing' : 'fresh',
    refreshReason: needsRefresh ? 'spatial_refresh' : 'spatial_current',
    completedAt: needsRefresh ? new Date().toISOString() : input.lastSpatialRefresh || null,
  };
}
