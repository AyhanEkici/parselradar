import React from 'react';

export default function LiquidityScoreCard({ liquidity }: { liquidity?: { value?: string; source?: string; freshnessDays?: number; confidence?: number; inferenceLevel?: string } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Liquidity Profile</div>
      <div className="mt-1 text-lg font-semibold text-slate-900">{liquidity?.value || 'ILLIQUID'}</div>
      <div className="mt-2 text-xs text-slate-600">{liquidity?.source || 'No source available'}</div>
      <div className="mt-1 text-xs text-slate-500">freshness {liquidity?.freshnessDays ?? '-'}d | confidence {liquidity?.confidence ?? '-'} | {liquidity?.inferenceLevel || 'unavailable'}</div>
    </div>
  );
}
