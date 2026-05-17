import React from 'react';

type ValuationBandCardProps = {
  askingPriceTRY?: number;
  valuationBand?: {
    low?: number;
    mid?: number;
    high?: number;
    currency?: string;
  };
};

type PositionKey = 'UNDER_MARKET' | 'FAIR_MARKET' | 'PREMIUM' | 'SPECULATIVE';

function formatTRY(value?: number) {
  return typeof value === 'number' ? `${value.toLocaleString('tr-TR')} TL` : '-';
}

function resolvePosition(asking?: number, band?: ValuationBandCardProps['valuationBand']): PositionKey {
  if (typeof asking !== 'number' || !band?.low || !band?.high) return 'FAIR_MARKET';
  if (asking < band.low) return 'UNDER_MARKET';
  if (asking <= band.high) return 'FAIR_MARKET';
  if (band.high > 0 && asking > band.high * 1.2) return 'SPECULATIVE';
  return 'PREMIUM';
}

const TONES: Record<PositionKey, string> = {
  UNDER_MARKET: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  FAIR_MARKET: 'bg-blue-50 border-blue-200 text-blue-800',
  PREMIUM: 'bg-amber-50 border-amber-200 text-amber-800',
  SPECULATIVE: 'bg-red-50 border-red-200 text-red-800',
};

const LABELS: Record<PositionKey, string> = {
  UNDER_MARKET: 'Under market',
  FAIR_MARKET: 'Fair market',
  PREMIUM: 'Premium',
  SPECULATIVE: 'Speculative',
};

export function ValuationBandCard({ askingPriceTRY, valuationBand }: ValuationBandCardProps) {
  const position = resolvePosition(askingPriceTRY, valuationBand);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Valuation Band</h3>
      <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
          <div className="text-slate-500">Low</div>
          <div className="mt-1 font-semibold text-slate-900">{formatTRY(valuationBand?.low)}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
          <div className="text-slate-500">Mid</div>
          <div className="mt-1 font-semibold text-slate-900">{formatTRY(valuationBand?.mid)}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
          <div className="text-slate-500">High</div>
          <div className="mt-1 font-semibold text-slate-900">{formatTRY(valuationBand?.high)}</div>
        </div>
      </div>

      <div className={`mt-4 rounded-lg border px-3 py-2 text-sm font-semibold ${TONES[position]}`}>
        {LABELS[position]}
      </div>

      <div className="mt-2 text-xs text-slate-500">Asking price: {formatTRY(askingPriceTRY)}</div>
    </section>
  );
}
