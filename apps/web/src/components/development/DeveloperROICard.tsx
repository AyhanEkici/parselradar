import React from 'react';

type Props = {
  developerROI?: {
    score: number;
    scenario: 'conservative' | 'moderate' | 'aggressive';
    roiSignals: string[];
  };
};

const colorMap = {
  conservative: 'from-slate-400 to-slate-500',
  moderate: 'from-blue-500 to-cyan-500',
  aggressive: 'from-emerald-500 to-teal-500',
};

export const DeveloperROICard: React.FC<Props> = ({ developerROI }) => {
  if (!developerROI) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Developer ROI</h3>
          <p className="mt-1 text-xs text-slate-600">Deterministic upside score only</p>
        </div>
        <div className="text-lg font-semibold text-slate-900">{developerROI.score}</div>
      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full bg-gradient-to-r ${colorMap[developerROI.scenario]}`} style={{ width: `${Math.min(100, developerROI.score)}%` }} />
      </div>

      <div className="mt-3 text-sm font-medium capitalize text-slate-800">{developerROI.scenario}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {developerROI.roiSignals.map((signal) => (
          <span key={signal} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-800 border border-blue-100">
            {signal.replace(/_/g, ' ')}
          </span>
        ))}
      </div>
    </div>
  );
};
