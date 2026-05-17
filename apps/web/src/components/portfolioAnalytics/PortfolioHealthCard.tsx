import React from 'react';

type Props = {
  health?: any;
};

export default function PortfolioHealthCard({ health }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Portfolio Health</div>
      <div className="mt-2 text-2xl font-bold text-slate-900">{health?.healthScore ?? 0}</div>
      <div className="mt-1 text-sm text-slate-700">Status: {health?.status || 'FRAGILE'}</div>
      <div className="mt-2 text-xs text-slate-500">{health?.note || '-'}</div>
    </div>
  );
}
