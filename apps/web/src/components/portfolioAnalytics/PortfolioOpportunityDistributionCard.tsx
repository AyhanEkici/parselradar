import React from 'react';

type Props = {
  distribution?: any;
};

export default function PortfolioOpportunityDistributionCard({ distribution }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Opportunity Distribution</div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-slate-700">
        <div>High: {distribution?.counts?.high ?? 0}</div>
        <div>Medium: {distribution?.counts?.medium ?? 0}</div>
        <div>Low: {distribution?.counts?.low ?? 0}</div>
        <div>Unknown: {distribution?.counts?.unknown ?? 0}</div>
      </div>
      <div className="mt-2 text-xs text-slate-500">High ratio: {distribution?.ratios?.high ?? 0}%</div>
    </div>
  );
}
