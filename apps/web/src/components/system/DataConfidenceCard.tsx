import React from 'react';

type Props = {
  sourceConfidence?: 'low' | 'medium' | 'verified' | string;
  ingestionSignals?: string[];
};

export const DataConfidenceCard: React.FC<Props> = ({ sourceConfidence = 'low', ingestionSignals = [] }) => {
  const tones: Record<string, string> = {
    low: 'bg-red-50 text-red-900 border-red-100',
    medium: 'bg-amber-50 text-amber-900 border-amber-100',
    verified: 'bg-emerald-50 text-emerald-900 border-emerald-100',
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900">Data Confidence</h3>
        <div className={`rounded-lg border px-3 py-1 text-sm font-semibold ${tones[sourceConfidence] || tones.low}`}>
          {sourceConfidence}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {ingestionSignals.map((signal) => (
          <span key={signal} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
            {signal.replace(/_/g, ' ')}
          </span>
        ))}
      </div>
    </div>
  );
};
