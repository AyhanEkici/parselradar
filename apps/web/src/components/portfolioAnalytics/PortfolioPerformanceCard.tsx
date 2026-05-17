import React from 'react';

type Props = {
  performance?: any;
};

export default function PortfolioPerformanceCard({ performance }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Performance Snapshot</div>
      <div className="mt-2 text-sm text-slate-700">Avg Score: {performance?.intelligencePerformance?.averageScore ?? 0}</div>
      <div className="mt-1 text-sm text-slate-700">Avg Opportunity: {performance?.intelligencePerformance?.averageOpportunity ?? 0}</div>
      <div className="mt-1 text-sm text-slate-700">Freshness Avg: {performance?.intelligencePerformance?.freshnessScoreAverage ?? 0}</div>
      <div className="mt-1 text-sm text-slate-700">Confidence Avg: {performance?.intelligencePerformance?.confidenceAverage ?? 0}</div>
      <div className="mt-2 text-xs text-slate-500">Coverage: {(performance?.sourceCoverage?.coverageRatio ?? 0) * 100}%</div>
    </div>
  );
}
