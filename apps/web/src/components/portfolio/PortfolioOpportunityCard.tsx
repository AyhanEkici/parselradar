import React from 'react';

type Props = {
  opportunity: any;
};

export default function PortfolioOpportunityCard({ opportunity }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-slate-900">Opportunity</div>
      <div className="mt-2 text-xs text-slate-600">Average Score: {opportunity?.averageScore ?? 0}</div>
      <div className="mt-1 text-xs text-slate-600">Average Opportunity: {opportunity?.averageOpportunity ?? 0}</div>
      <div className="mt-1 text-xs text-slate-600">High Potential: {opportunity?.highPotentialCount ?? 0}</div>
      <div className="mt-1 text-xs text-slate-600">Stale Intelligence: {opportunity?.staleIntelligenceCount ?? 0}</div>
    </div>
  );
}
