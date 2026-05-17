import React from 'react';

type Props = {
  rezoningUpside?: {
    score: number;
    scenario: 'stable' | 'moderate_upside' | 'speculative_upside' | 'infrastructure_linked';
    signals: string[];
  };
};

export const RezoningUpsideCard: React.FC<Props> = ({ rezoningUpside }) => {
  if (!rezoningUpside) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Rezoning Upside</h3>
          <p className="mt-1 text-xs text-slate-600">Scenario-driven planning sensitivity</p>
        </div>
        <div className="rounded-lg bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-900 border border-amber-100">
          {rezoningUpside.score}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3">
        <div className="text-xs uppercase tracking-wide text-amber-700">Scenario</div>
        <div className="mt-1 text-base font-semibold text-amber-900">{rezoningUpside.scenario.replace(/_/g, ' ')}</div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {rezoningUpside.signals.map((signal) => (
          <span key={signal} className="rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-xs text-amber-900">
            {signal.replace(/_/g, ' ')}
          </span>
        ))}
      </div>
    </div>
  );
};
