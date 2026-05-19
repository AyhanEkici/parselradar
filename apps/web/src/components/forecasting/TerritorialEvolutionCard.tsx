import React from 'react';

export default function TerritorialEvolutionCard({ evolution }: { evolution?: { value?: string; source?: string; freshnessDays?: number; confidence?: number; inferenceLevel?: string } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Territorial Evolution</div>
      <div className="mt-1 text-lg font-semibold text-slate-900">{evolution?.value || 'STABLE'}</div>
      <div className="mt-2 text-xs text-slate-600">{evolution?.source || 'No source available'}</div>
      <div className="mt-1 text-xs text-slate-500">freshness {evolution?.freshnessDays ?? '-'}d | confidence {evolution?.confidence ?? '-'} | {evolution?.inferenceLevel || 'unavailable'}</div>
    </div>
  );
}
