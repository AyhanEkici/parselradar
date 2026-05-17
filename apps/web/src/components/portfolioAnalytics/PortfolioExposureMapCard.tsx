import React from 'react';

type Props = {
  exposure?: any;
};

function rows(items: any[] = []) {
  return items.slice(0, 5).map((row) => (
    <div key={row.key} className="flex items-center justify-between text-xs text-slate-700">
      <span>{row.key}</span>
      <span>{row.weightPercent}%</span>
    </div>
  ));
}

export default function PortfolioExposureMapCard({ exposure }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Exposure Map</div>
      <div>
        <div className="mb-1 text-xs font-semibold text-slate-600">City</div>
        {rows(exposure?.byCity || [])}
      </div>
      <div>
        <div className="mb-1 text-xs font-semibold text-slate-600">Asset Type</div>
        {rows(exposure?.byAssetType || [])}
      </div>
      <div>
        <div className="mb-1 text-xs font-semibold text-slate-600">Liquidity</div>
        {rows(exposure?.byLiquidityBand || [])}
      </div>
    </div>
  );
}
