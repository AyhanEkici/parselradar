import React from 'react';

type Props = { data?: any };

export default function InvestorAnalyticsCard({ data }: Props) {
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Investor Analytics</div>
      <div className="mt-2 text-sm text-emerald-900">Saved Analyses: {data?.savedAnalyses || 0}</div>
      <div className="mt-1 text-sm text-emerald-900">Watchlist Items: {data?.watchlistItems || 0}</div>
      <div className="mt-1 text-sm text-emerald-900">Portfolios: {data?.portfolios || 0}</div>
      <div className="mt-1 text-sm text-emerald-900">Portfolio Items: {data?.portfolioItems || 0}</div>
    </div>
  );
}
