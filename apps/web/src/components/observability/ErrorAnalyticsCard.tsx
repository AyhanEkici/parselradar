import React from 'react';

type Props = {
  errorAnalytics?: any;
};

export default function ErrorAnalyticsCard({ errorAnalytics }: Props) {
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-rose-700">Error Analytics</div>
      <div className="mt-2 text-xl font-bold text-rose-900">{errorAnalytics?.errorState || 'READY'}</div>
      <div className="mt-2 text-sm text-rose-900">Failed Deliveries: {errorAnalytics?.failedDeliveries || 0}</div>
      <div className="mt-1 text-sm text-rose-900">Suppressed Deliveries: {errorAnalytics?.suppressedDeliveries || 0}</div>
      <div className="mt-1 text-sm text-rose-900">Failed Workspace Actions: {errorAnalytics?.failedWorkspaceActions || 0}</div>
    </div>
  );
}
