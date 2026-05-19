import React from 'react';

export default function RegionalDemandCard({ regionalDemand }: { regionalDemand?: { value?: string; source?: string; freshnessDays?: number; confidence?: number; inferenceLevel?: string } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Regional Demand</div>
      <div className="mt-1 text-lg font-semibold text-slate-900">{regionalDemand?.value || 'LOW'}</div>
      <div className="mt-2 text-xs text-slate-600">{regionalDemand?.source || 'No source available'}</div>
      <div className="mt-1 text-xs text-slate-500">freshness {regionalDemand?.freshnessDays ?? '-'}d | confidence {regionalDemand?.confidence ?? '-'} | {regionalDemand?.inferenceLevel || 'unavailable'}</div>
    </div>
  );
}
