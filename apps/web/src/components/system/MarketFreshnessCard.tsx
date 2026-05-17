import React from 'react';

type Props = {
  freshnessScore?: number;
  cacheState?: { market?: string; comparable?: string; spatial?: string };
};

export const MarketFreshnessCard: React.FC<Props> = ({ freshnessScore = 0, cacheState }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Market Freshness</h3>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500" style={{ width: `${Math.min(100, freshnessScore)}%` }} />
      </div>
      <div className="mt-2 text-lg font-semibold text-slate-900">{freshnessScore}</div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-slate-700">
        <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">Market {cacheState?.market || '-'}</div>
        <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">Comparable {cacheState?.comparable || '-'}</div>
        <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">Spatial {cacheState?.spatial || '-'}</div>
      </div>
    </div>
  );
};
