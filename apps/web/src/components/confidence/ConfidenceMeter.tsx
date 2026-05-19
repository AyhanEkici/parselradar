import React from 'react';

type ConfidenceClass = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH' | string;

function colorFor(value?: ConfidenceClass) {
  if (value === 'VERY_HIGH') return 'bg-emerald-500';
  if (value === 'HIGH') return 'bg-cyan-500';
  if (value === 'MODERATE') return 'bg-amber-500';
  return 'bg-rose-500';
}

export default function ConfidenceMeter({
  score,
  classification,
}: {
  score?: number;
  classification?: ConfidenceClass;
}) {
  const safeScore = Math.max(0, Math.min(100, Number(score || 0)));
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-600">
        <span>Confidence</span>
        <span>{classification || 'LOW'}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100">
        <div className={`h-2 rounded-full ${colorFor(classification)}`} style={{ width: `${safeScore}%` }} />
      </div>
      <div className="mt-2 text-sm text-slate-700">Score: {safeScore}</div>
    </div>
  );
}
