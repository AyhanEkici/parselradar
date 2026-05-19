import React from 'react';

export default function TerritorialRiskCard({ risk }: { risk?: { matrixScore?: number; source?: string; timestamp?: string; freshness?: number; confidence?: number; governanceState?: string; inferenceLevel?: string; executionReadiness?: string; evidenceLineage?: unknown[] } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Territorial Risk</h3>
      <p className="mt-2 text-xs text-slate-700">Matrix score: {risk?.matrixScore ?? '-'}</p>
      <p className="text-xs text-slate-700">Execution readiness: {risk?.executionReadiness || '-'}</p>
      <p className="text-xs text-slate-700">Source: {risk?.source || '-'}</p>
      <p className="text-xs text-slate-700">Timestamp: {risk?.timestamp || '-'}</p>
      <p className="text-xs text-slate-700">Freshness: {risk?.freshness ?? '-'}</p>
      <p className="text-xs text-slate-700">Confidence: {risk?.confidence ?? '-'}</p>
      <p className="text-xs text-slate-600">Governance: {risk?.governanceState || '-'}</p>
      <p className="text-xs text-slate-600">Inference: {risk?.inferenceLevel || '-'}</p>
      <p className="text-xs text-slate-600">Lineage: {(risk?.evidenceLineage || []).length}</p>
    </div>
  );
}
