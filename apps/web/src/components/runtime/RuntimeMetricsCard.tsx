import React from 'react';

type Props = {
  runtimeMetrics?: {
    queueDepthTotal?: number;
    failureRatePercent?: number;
    analysisThroughputPerHour?: number;
    refreshThroughputPerHour?: number;
    staleAnalysisCount?: number;
    staleRefreshCount?: number;
  };
};

export function RuntimeMetricsCard({ runtimeMetrics }: Props) {
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Runtime Metrics</div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-emerald-900">
        <div>Queue Depth: {runtimeMetrics?.queueDepthTotal ?? 0}</div>
        <div>Failure Rate: {runtimeMetrics?.failureRatePercent ?? 0}%</div>
        <div>Analysis/h: {runtimeMetrics?.analysisThroughputPerHour ?? 0}</div>
        <div>Refresh/h: {runtimeMetrics?.refreshThroughputPerHour ?? 0}</div>
        <div>Stale Analysis: {runtimeMetrics?.staleAnalysisCount ?? 0}</div>
        <div>Stale Refresh: {runtimeMetrics?.staleRefreshCount ?? 0}</div>
      </div>
    </div>
  );
}
