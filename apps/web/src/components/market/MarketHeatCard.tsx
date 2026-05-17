import React from 'react';

type MarketHeatCardProps = {
  marketHeat?: 'COLD' | 'STABLE' | 'ACTIVE' | 'HOT' | string;
  comparableCount?: number;
};

function heatTone(heat?: string) {
  switch ((heat || '').toUpperCase()) {
    case 'HOT':
      return 'bg-red-50 border-red-200 text-red-800';
    case 'ACTIVE':
      return 'bg-amber-50 border-amber-200 text-amber-800';
    case 'STABLE':
      return 'bg-blue-50 border-blue-200 text-blue-800';
    case 'COLD':
      return 'bg-slate-50 border-slate-200 text-slate-700';
    default:
      return 'bg-slate-50 border-slate-200 text-slate-700';
  }
}

function heatBar(heat?: string) {
  switch ((heat || '').toUpperCase()) {
    case 'HOT':
      return 95;
    case 'ACTIVE':
      return 75;
    case 'STABLE':
      return 55;
    case 'COLD':
      return 30;
    default:
      return 40;
  }
}

export function MarketHeatCard({ marketHeat = 'STABLE', comparableCount = 0 }: MarketHeatCardProps) {
  const bar = heatBar(marketHeat);
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Market Heat</h3>
      <div className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${heatTone(marketHeat)}`}>
        {marketHeat}
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full bg-blue-600" style={{ width: `${bar}%` }} />
      </div>

      <p className="mt-3 text-xs text-slate-600">Based on recency and similarity of {comparableCount} comparable parcel(s).</p>
    </section>
  );
}
