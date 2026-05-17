import React from 'react';

type PricingPositionCardProps = {
  pricingPosition?: 'UNDER_MARKET' | 'FAIR_MARKET' | 'ABOVE_MARKET' | 'HEAVILY_OVERPRICED' | string;
  subjectPricePerM2?: number;
  avgComparablePricePerM2?: number;
};

function positionTone(position?: string) {
  const p = (position || '').toUpperCase();
  if (p === 'UNDER_MARKET') return 'bg-emerald-50 border-emerald-200 text-emerald-800';
  if (p === 'FAIR_MARKET') return 'bg-blue-50 border-blue-200 text-blue-800';
  if (p === 'ABOVE_MARKET') return 'bg-amber-50 border-amber-200 text-amber-800';
  return 'bg-red-50 border-red-200 text-red-800';
}

function fmt(value?: number) {
  return typeof value === 'number' ? `${value.toLocaleString('tr-TR')} TL/m²` : '-';
}

export function PricingPositionCard({ pricingPosition, subjectPricePerM2, avgComparablePricePerM2 }: PricingPositionCardProps) {
  const base = typeof avgComparablePricePerM2 === 'number' && avgComparablePricePerM2 > 0 ? avgComparablePricePerM2 : 1;
  const subject = typeof subjectPricePerM2 === 'number' ? subjectPricePerM2 : base;
  const delta = ((subject - base) / base) * 100;
  const width = Math.min(100, Math.max(0, 50 + delta));

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Pricing Position</h3>
      <div className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${positionTone(pricingPosition)}`}>
        {pricingPosition || 'FAIR_MARKET'}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
          <div className="text-slate-500">Subject</div>
          <div className="mt-1 font-semibold text-slate-900">{fmt(subjectPricePerM2)}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
          <div className="text-slate-500">Comparable avg</div>
          <div className="mt-1 font-semibold text-slate-900">{fmt(avgComparablePricePerM2)}</div>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full bg-blue-600" style={{ width: `${width}%` }} />
      </div>
      <div className="mt-2 text-xs text-slate-600">Pricing delta: {delta.toFixed(1)}%</div>
    </section>
  );
}
