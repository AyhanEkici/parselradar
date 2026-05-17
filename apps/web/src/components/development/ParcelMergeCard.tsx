import React from 'react';

type Props = {
  parcelMergeOpportunity?: {
    score: number;
    level: 'limited' | 'assembly' | 'expansion';
    signals: string[];
  };
};

export const ParcelMergeCard: React.FC<Props> = ({ parcelMergeOpportunity }) => {
  if (!parcelMergeOpportunity) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Parcel Merge</h3>
          <p className="mt-1 text-xs text-slate-600">Assembly and aggregation signal</p>
        </div>
        <div className="text-lg font-semibold text-slate-900">{parcelMergeOpportunity.score}</div>
      </div>

      <div className="mt-4 rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-3">
        <div className="text-xs uppercase tracking-wide text-indigo-700">Level</div>
        <div className="mt-1 text-base font-semibold capitalize text-indigo-900">{parcelMergeOpportunity.level}</div>
      </div>

      <div className="mt-4 space-y-2">
        {parcelMergeOpportunity.signals.length > 0 ? parcelMergeOpportunity.signals.map((signal) => (
          <div key={signal} className="rounded-lg border border-indigo-100 bg-white px-3 py-2 text-xs text-slate-700">
            {signal.replace(/_/g, ' ')}
          </div>
        )) : <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">No strong assembly signal detected.</div>}
      </div>
    </div>
  );
};
