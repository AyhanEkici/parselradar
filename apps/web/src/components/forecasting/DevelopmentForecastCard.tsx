import React from 'react';

export default function DevelopmentForecastCard({ forecast }: { forecast?: { value?: string; source?: string; freshnessDays?: number; confidence?: number; inferenceLevel?: string } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Development Probability</div>
      <div className="mt-1 text-lg font-semibold text-slate-900">{forecast?.value || 'VERY_LOW'}</div>
      <div className="mt-2 text-xs text-slate-600">{forecast?.source || 'No source available'}</div>
      <div className="mt-1 text-xs text-slate-500">freshness {forecast?.freshnessDays ?? '-'}d | confidence {forecast?.confidence ?? '-'} | {forecast?.inferenceLevel || 'unavailable'}</div>
    </div>
  );
}
