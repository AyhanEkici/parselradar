import React from 'react';

export default function OpportunityPriorityCard({ opportunity }: { opportunity?: { priorityScore?: number; matrixBand?: string; source?: string; freshness?: number; confidence?: number; governanceState?: string; inferenceLevel?: string; evidenceLineage?: unknown[] } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Opportunity Priority</h3>
      <p className="mt-2 text-xs text-slate-700">Priority score: {opportunity?.priorityScore ?? '-'}</p>
      <p className="text-xs text-slate-700">Matrix band: {opportunity?.matrixBand || '-'}</p>
      <p className="text-xs text-slate-700">Source: {opportunity?.source || '-'}</p>
      <p className="text-xs text-slate-700">Freshness: {opportunity?.freshness ?? '-'}</p>
      <p className="text-xs text-slate-700">Confidence: {opportunity?.confidence ?? '-'}</p>
      <p className="text-xs text-slate-600">Governance: {opportunity?.governanceState || '-'}</p>
      <p className="text-xs text-slate-600">Inference: {opportunity?.inferenceLevel || '-'}</p>
      <p className="text-xs text-slate-600">Lineage: {(opportunity?.evidenceLineage || []).length}</p>
    </div>
  );
}
