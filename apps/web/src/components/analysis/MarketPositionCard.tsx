import React from 'react';

type MarketPositionCardProps = {
  marketPosition?: string;
  liquiditySignal?: string;
  developerFit?: string;
  zoningPotential?: string;
  signal: string;
  score: number;
};

function pillTone(value?: string) {
  const v = (value || '').toUpperCase();
  if (v.includes('HIGH') || v.includes('STRONG') || v.includes('DISCOUNT')) return 'bg-emerald-50 border-emerald-200 text-emerald-700';
  if (v.includes('LOW') || v.includes('WEAK') || v.includes('STRETCHED')) return 'bg-red-50 border-red-200 text-red-700';
  return 'bg-blue-50 border-blue-200 text-blue-700';
}

function attractiveness(signal: string, score: number) {
  if (signal === 'STRONG' || score >= 78) return 'High attractiveness';
  if (signal === 'MODERATE' || score >= 58) return 'Balanced attractiveness';
  if (signal === 'WEAK' || score >= 40) return 'Constrained attractiveness';
  return 'Needs deep review';
}

export function MarketPositionCard({ marketPosition, liquiditySignal, developerFit, zoningPotential, signal, score }: MarketPositionCardProps) {
  const rows = [
    { label: 'Market position', value: marketPosition || '-' },
    { label: 'Liquidity signal', value: liquiditySignal || '-' },
    { label: 'Developer fit', value: developerFit || '-' },
    { label: 'Zoning potential', value: zoningPotential || '-' },
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Market Position</h3>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <div className="text-xs text-slate-500">{row.label}</div>
            <span className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${pillTone(row.value)}`}>
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
        Investment attractiveness: <span className="font-semibold">{attractiveness(signal, score)}</span>
      </div>
    </section>
  );
}
