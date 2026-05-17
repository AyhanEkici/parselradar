import React from 'react';

type ComparablePropertiesCardProps = {
  comparableCount?: number;
  avgComparablePricePerM2?: number;
  comparableSummary?: string;
};

function formatPpm2(value?: number) {
  return typeof value === 'number' ? `${value.toLocaleString('tr-TR')} TL/m²` : '-';
}

export function ComparablePropertiesCard({ comparableCount = 0, avgComparablePricePerM2, comparableSummary }: ComparablePropertiesCardProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Comparable Properties</h3>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="text-xs text-blue-700">Comparable count</div>
          <div className="mt-1 text-2xl font-semibold text-blue-900">{comparableCount}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs text-slate-600">Avg comparable price</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">{formatPpm2(avgComparablePricePerM2)}</div>
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-600">{comparableSummary || 'Comparable market summary is not available yet.'}</p>
    </section>
  );
}
