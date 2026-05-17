import React from 'react';

type Props = {
  densityPotential?: {
    category: 'low_rise' | 'mid_rise' | 'mixed_use' | 'industrial' | 'tourism';
    score: number;
    supportingSignals: string[];
  };
  projectability?: {
    score: number;
    level: 'easy' | 'moderate' | 'difficult';
    blockers: string[];
  };
};

const labels = {
  low_rise: 'Low-rise',
  mid_rise: 'Mid-rise',
  mixed_use: 'Mixed-use',
  industrial: 'Industrial',
  tourism: 'Tourism',
};

export const DevelopmentPotentialCard: React.FC<Props> = ({ densityPotential, projectability }) => {
  if (!densityPotential) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Development Potential</h3>
          <p className="mt-1 text-xs text-slate-600">Density envelope and buildability readiness</p>
        </div>
        <div className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-900">
          {densityPotential.score}
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-gradient-to-r from-slate-900 to-slate-700 px-4 py-3 text-white">
        <div className="text-xs uppercase tracking-wide text-slate-200">Scenario</div>
        <div className="mt-1 text-lg font-semibold">{labels[densityPotential.category]}</div>
      </div>

      {projectability && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2">
            <div className="text-xs text-emerald-700">Projectability</div>
            <div className="text-base font-semibold text-emerald-900">{projectability.level}</div>
          </div>
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
            <div className="text-xs text-blue-700">Buildability</div>
            <div className="text-base font-semibold text-blue-900">{projectability.score}</div>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {densityPotential.supportingSignals.map((signal) => (
          <span key={signal} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
            {signal.replace(/_/g, ' ')}
          </span>
        ))}
      </div>
    </div>
  );
};
