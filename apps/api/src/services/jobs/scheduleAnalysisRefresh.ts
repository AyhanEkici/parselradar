import { INGESTION_THRESHOLDS } from '../../config/ingestion/ingestionThresholds';

function hoursSince(date?: string | Date | null) {
  if (!date) return Number.POSITIVE_INFINITY;
  const value = new Date(date).getTime();
  if (Number.isNaN(value)) return Number.POSITIVE_INFINITY;
  return (Date.now() - value) / (1000 * 60 * 60);
}

export function scheduleAnalysisRefresh(input: {
  propertyId: string;
  lastAnalysisAt?: string | Date | null;
  lastSpatialRefresh?: string | Date | null;
  lastMarketRefresh?: string | Date | null;
}) {
  const staleFlags: string[] = [];

  if (hoursSince(input.lastAnalysisAt) > INGESTION_THRESHOLDS.staleHours.analysis) staleFlags.push('analysis_stale');
  if (hoursSince(input.lastSpatialRefresh) > INGESTION_THRESHOLDS.staleHours.spatial) staleFlags.push('spatial_stale');
  if (hoursSince(input.lastMarketRefresh) > INGESTION_THRESHOLDS.staleHours.market) staleFlags.push('market_stale');

  return {
    propertyId: input.propertyId,
    refreshStatus: staleFlags.length > 0 ? 'queued' : 'fresh',
    staleFlags,
    refreshReason: staleFlags[0] || 'scheduled_review',
  };
}
