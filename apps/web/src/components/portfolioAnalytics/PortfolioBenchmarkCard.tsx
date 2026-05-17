import React from 'react';

type Props = {
  benchmark?: any;
};

export default function PortfolioBenchmarkCard({ benchmark }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Benchmark Snapshot</div>
      <div className="mt-2 text-sm text-slate-700">Signal: {benchmark?.portfolioBenchmark?.signal || '-'}</div>
      <div className="mt-1 text-sm text-slate-700">Opportunity Delta: {benchmark?.portfolioBenchmark?.opportunityDelta ?? 0}</div>
      <div className="mt-1 text-sm text-slate-700">Score Delta: {benchmark?.portfolioBenchmark?.scoreDelta ?? 0}</div>
      <div className="mt-2 text-xs text-slate-500">{benchmark?.portfolioBenchmark?.methodology || '-'}</div>
    </div>
  );
}
