import React from 'react';

export default function PortfolioIntelligenceCard({ portfolio }: { portfolio?: { portfolioExposure?: string; score?: number; source?: string; freshness?: number; confidence?: number; governanceState?: string; inferenceLevel?: string; evidenceLineage?: unknown[] } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Portfolio Intelligence</h3>
      <p className="mt-2 text-xs text-slate-700">Exposure: {portfolio?.portfolioExposure || '-'}</p>
      <p className="text-xs text-slate-700">Score: {portfolio?.score ?? '-'}</p>
      <p className="text-xs text-slate-700">Source: {portfolio?.source || '-'}</p>
      <p className="text-xs text-slate-700">Freshness: {portfolio?.freshness ?? '-'}</p>
      <p className="text-xs text-slate-700">Confidence: {portfolio?.confidence ?? '-'}</p>
      <p className="text-xs text-slate-600">Governance: {portfolio?.governanceState || '-'}</p>
      <p className="text-xs text-slate-600">Inference: {portfolio?.inferenceLevel || '-'}</p>
      <p className="text-xs text-slate-600">Lineage: {(portfolio?.evidenceLineage || []).length}</p>
    </div>
  );
}
