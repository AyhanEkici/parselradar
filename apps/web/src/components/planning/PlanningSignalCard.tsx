import React from 'react';

export default function PlanningSignalCard({ planningLayer }: { planningLayer?: { value?: string; source?: string; freshnessDays?: number; confidence?: number; inferenceLevel?: string } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Planning Layer</div>
      <div className="mt-1 text-lg font-semibold text-slate-900">{planningLayer?.value || '1_100000_MACRO_SIGNAL'}</div>
      <div className="mt-2 text-xs text-slate-600">{planningLayer?.source || 'No source available'}</div>
      <div className="mt-1 text-xs text-slate-500">freshness {planningLayer?.freshnessDays ?? '-'}d | confidence {planningLayer?.confidence ?? '-'} | {planningLayer?.inferenceLevel || 'unavailable'}</div>
    </div>
  );
}
