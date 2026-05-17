import React from 'react';

type Props = {
  exposure: any;
};

export default function PortfolioExposureCard({ exposure }: Props) {
  const byCity = exposure?.byCity || {};
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-slate-900">Exposure</div>
      <div className="mt-2 text-xs text-slate-600">Total Value: {Number(exposure?.totalValue || 0).toLocaleString('tr-TR')} TL</div>
      <div className="mt-1 text-xs text-slate-600">Total Weight: {exposure?.totalWeight || 0}</div>
      <div className="mt-3 space-y-1">
        {Object.keys(byCity).length === 0 ? (
          <div className="text-xs text-slate-500">No city exposure data</div>
        ) : (
          Object.entries(byCity).map(([city, value]) => (
            <div key={city} className="flex items-center justify-between text-xs">
              <span className="uppercase text-slate-500">{city}</span>
              <span className="font-semibold text-slate-800">{Number(value || 0).toLocaleString('tr-TR')} TL</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
