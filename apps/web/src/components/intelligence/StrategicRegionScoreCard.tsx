import React from 'react';

export default function StrategicRegionScoreCard({ score }: { score?: { value?: number; source?: string; freshnessDays?: number; confidence?: number; inferenceLevel?: string } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Strategic Region Score</div>
      <div className="mt-1 text-lg font-semibold text-slate-900">{score?.value ?? 0}</div>
      <div className="mt-2 text-xs text-slate-600">{score?.source || 'No source available'}</div>
      <div className="mt-1 text-xs text-slate-500">freshness {score?.freshnessDays ?? '-'}d | confidence {score?.confidence ?? '-'} | {score?.inferenceLevel || 'unavailable'}</div>
    </div>
  );
}
