import React from 'react';

type Props = {
  concentrationRisk?: any;
};

export default function PortfolioConcentrationRiskCard({ concentrationRisk }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Concentration Risk</div>
      <div className="mt-2 text-2xl font-bold text-slate-900">{concentrationRisk?.concentrationIndex ?? 0}</div>
      <div className="mt-1 text-sm text-slate-700">Tier: {concentrationRisk?.riskTier || 'LOW'}</div>
      <div className="mt-2 text-xs text-slate-600">Top City: {concentrationRisk?.topConcentrations?.city?.key || '-'}</div>
      <div className="mt-1 text-xs text-slate-600">Top Asset: {concentrationRisk?.topConcentrations?.assetType?.key || '-'}</div>
      <div className="mt-1 text-xs text-slate-600">Top Liquidity: {concentrationRisk?.topConcentrations?.liquidityBand?.key || '-'}</div>
    </div>
  );
}
