import React from 'react';

type Props = {
  signals: any;
};

export default function WorkspaceSignalsCard({ signals }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-slate-900">Workspace Signals</div>
      <div className="mt-2 text-xs text-slate-600">Average Score: {signals?.averageScore || 0}</div>
      <div className="mt-1 text-xs text-slate-600">Average Opportunity: {signals?.averageOpportunity || 0}</div>
      <div className="mt-1 text-xs text-slate-600">High Potential: {signals?.highPotentialCount || 0}</div>
      <div className="mt-1 text-xs text-slate-600">Stale: {signals?.staleCount || 0}</div>
    </div>
  );
}
