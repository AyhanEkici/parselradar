import React from 'react';

export default function InvestorPriorityCard({ priority }: { priority?: { priority?: string; score?: number; source?: string; freshness?: number; confidence?: number; governanceState?: string; inferenceLevel?: string; evidenceLineage?: unknown[] } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Investor Priority</h3>
      <p className="mt-2 text-xs text-slate-700">Priority: {priority?.priority || '-'}</p>
      <p className="text-xs text-slate-700">Score: {priority?.score ?? '-'}</p>
      <p className="text-xs text-slate-700">Source: {priority?.source || '-'}</p>
      <p className="text-xs text-slate-700">Freshness: {priority?.freshness ?? '-'}</p>
      <p className="text-xs text-slate-700">Confidence: {priority?.confidence ?? '-'}</p>
      <p className="text-xs text-slate-600">Governance: {priority?.governanceState || '-'}</p>
      <p className="text-xs text-slate-600">Inference: {priority?.inferenceLevel || '-'}</p>
      <p className="text-xs text-slate-600">Lineage: {(priority?.evidenceLineage || []).length}</p>
    </div>
  );
}
