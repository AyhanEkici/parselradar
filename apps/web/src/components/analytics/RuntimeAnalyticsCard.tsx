import React from 'react';

type Props = { data?: any };

export default function RuntimeAnalyticsCard({ data }: Props) {
  return (
    <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Runtime Analytics</div>
      <div className="mt-2 text-sm text-indigo-900">Runtime Status: {data?.runtimeStatus || 'NOT_CONFIGURED'}</div>
      <div className="mt-1 text-sm text-indigo-900">Queue Depth: {data?.queueDepthTotal || 0}</div>
      <div className="mt-1 text-sm text-indigo-900">Failure Rate %: {data?.failureRatePercent || 0}</div>
      <div className="mt-1 text-sm text-indigo-900">Distributed Runtime: {data?.distributedRuntimeEnabled ? 'true' : 'false'}</div>
    </div>
  );
}
