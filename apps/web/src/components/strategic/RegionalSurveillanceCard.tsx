import React from 'react';

export default function RegionalSurveillanceCard({ surveillance }: { surveillance?: { surveillanceScore?: number; surveillanceState?: string; source?: string; freshness?: number; confidence?: number; governanceState?: string; inferenceLevel?: string; evidenceLineage?: unknown[] } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Regional Surveillance</h3>
      <p className="mt-2 text-xs text-slate-700">State: {surveillance?.surveillanceState || '-'}</p>
      <p className="text-xs text-slate-700">Score: {surveillance?.surveillanceScore ?? '-'}</p>
      <p className="text-xs text-slate-700">Source: {surveillance?.source || '-'}</p>
      <p className="text-xs text-slate-700">Freshness: {surveillance?.freshness ?? '-'}</p>
      <p className="text-xs text-slate-700">Confidence: {surveillance?.confidence ?? '-'}</p>
      <p className="text-xs text-slate-600">Governance: {surveillance?.governanceState || '-'}</p>
      <p className="text-xs text-slate-600">Inference: {surveillance?.inferenceLevel || '-'}</p>
      <p className="text-xs text-slate-600">Lineage: {(surveillance?.evidenceLineage || []).length}</p>
    </div>
  );
}
