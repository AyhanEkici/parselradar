import React from 'react';

type Props = { data?: any };

export default function WorkspaceAnalyticsCard({ data }: Props) {
  return (
    <div className="rounded-lg border border-fuchsia-200 bg-fuchsia-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-fuchsia-700">Workspace Analytics</div>
      <div className="mt-2 text-sm text-fuchsia-900">Organizations: {data?.organizations || 0}</div>
      <div className="mt-1 text-sm text-fuchsia-900">Active Members: {data?.activeMembers || 0}</div>
      <div className="mt-1 text-sm text-fuchsia-900">Shared Portfolio: {data?.sharedPortfolio || 0}</div>
      <div className="mt-1 text-sm text-fuchsia-900">Shared Watchlist: {data?.sharedWatchlist || 0}</div>
      <div className="mt-1 text-sm text-fuchsia-900">Shared Analyses: {data?.sharedAnalyses || 0}</div>
    </div>
  );
}
