import React from 'react';

export default function DemographicPressureCard({ demographic }: { demographic?: { value?: string; source?: string; freshnessDays?: number; confidence?: number; inferenceLevel?: string } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Demographic Trajectory</div>
      <div className="mt-1 text-lg font-semibold text-slate-900">{demographic?.value || 'STABLE'}</div>
      <div className="mt-2 text-xs text-slate-600">{demographic?.source || 'No source available'}</div>
      <div className="mt-1 text-xs text-slate-500">freshness {demographic?.freshnessDays ?? '-'}d | confidence {demographic?.confidence ?? '-'} | {demographic?.inferenceLevel || 'unavailable'}</div>
    </div>
  );
}
