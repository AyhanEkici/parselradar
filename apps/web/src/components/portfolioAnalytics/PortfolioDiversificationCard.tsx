import React from 'react';

type Props = {
  diversification?: any;
};

export default function PortfolioDiversificationCard({ diversification }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Diversification</div>
      <div className="mt-2 text-2xl font-bold text-slate-900">{diversification?.overallDiversificationScore ?? 0}</div>
      <div className="mt-2 space-y-1 text-sm text-slate-700">
        <div>City: {diversification?.dimensions?.cityDiversification ?? 0}</div>
        <div>Asset Type: {diversification?.dimensions?.assetDiversification ?? 0}</div>
        <div>Liquidity: {diversification?.dimensions?.liquidityDiversification ?? 0}</div>
      </div>
    </div>
  );
}
