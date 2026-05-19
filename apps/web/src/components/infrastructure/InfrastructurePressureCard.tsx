import React from 'react';

export default function InfrastructurePressureCard({ pressure }: { pressure?: { value?: string; source?: string; freshnessDays?: number; confidence?: number; inferenceLevel?: string } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Infrastructure Pressure</div>
      <div className="mt-1 text-lg font-semibold text-slate-900">{pressure?.value || 'NONE'}</div>
      <div className="mt-2 text-xs text-slate-600">{pressure?.source || 'No source available'}</div>
      <div className="mt-1 text-xs text-slate-500">freshness {pressure?.freshnessDays ?? '-'}d | confidence {pressure?.confidence ?? '-'} | {pressure?.inferenceLevel || 'unavailable'}</div>
    </div>
  );
}
