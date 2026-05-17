import React from 'react';

type Props = {
  marketMomentum?: number;
  trendSignals?: string[];
};

export const MarketMomentumCard: React.FC<Props> = ({ marketMomentum = 0, trendSignals = [] }) => {
  const label = marketMomentum >= 75 ? 'High' : marketMomentum >= 55 ? 'Medium' : 'Low';

  return (
    <div className="h-full rounded-xl border border-sky-200 bg-sky-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-sky-700">Market Momentum</div>
      <div className="mt-2 text-3xl font-bold text-sky-900">{marketMomentum}</div>
      <div className="mt-1 text-sm text-sky-800">{label} momentum</div>
      <div className="mt-3 h-2 rounded-full bg-sky-100">
        <div className="h-full rounded-full bg-sky-500" style={{ width: `${Math.min(100, marketMomentum)}%` }} />
      </div>
      <div className="mt-3 text-xs text-sky-700">Signals: {trendSignals.slice(0, 2).join(' | ') || '-'}</div>
    </div>
  );
};
