import React from 'react';

type Props = {
  subdivisionPotential?: {
    level: 'low' | 'medium' | 'high';
    score: number;
    splitabilitySignals: string[];
  };
};

const tones = {
  low: 'bg-red-50 border-red-200 text-red-900',
  medium: 'bg-amber-50 border-amber-200 text-amber-900',
  high: 'bg-emerald-50 border-emerald-200 text-emerald-900',
};

export const SubdivisionCard: React.FC<Props> = ({ subdivisionPotential }) => {
  if (!subdivisionPotential) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Subdivision Potential</h3>
          <p className="mt-1 text-xs text-slate-600">Splitability heuristic from site scale and access</p>
        </div>
        <div className={`rounded-lg border px-3 py-1 text-sm font-semibold capitalize ${tones[subdivisionPotential.level]}`}>
          {subdivisionPotential.level}
        </div>
      </div>

      <div className="mt-4 text-3xl font-bold text-slate-900">{subdivisionPotential.score}</div>
      <div className="mt-3 space-y-2">
        {subdivisionPotential.splitabilitySignals.map((signal) => (
          <div key={signal} className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700 border border-slate-100">
            {signal.replace(/_/g, ' ')}
          </div>
        ))}
      </div>
    </div>
  );
};
