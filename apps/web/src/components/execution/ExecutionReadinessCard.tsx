import React from 'react';

export default function ExecutionReadinessCard({ readiness }: { readiness?: { readinessScore?: number; executionReadiness?: string; source?: string; timestamp?: string; freshness?: number; confidence?: number; governanceState?: string; inferenceLevel?: string; evidenceLineage?: unknown[] } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Execution Readiness</h3>
      <p className="mt-2 text-xs text-slate-700">Readiness: {readiness?.executionReadiness || '-'}</p>
      <p className="text-xs text-slate-700">Score: {readiness?.readinessScore ?? '-'}</p>
      <p className="text-xs text-slate-700">Source: {readiness?.source || '-'}</p>
      <p className="text-xs text-slate-700">Timestamp: {readiness?.timestamp || '-'}</p>
      <p className="text-xs text-slate-700">Freshness: {readiness?.freshness ?? '-'}</p>
      <p className="text-xs text-slate-700">Confidence: {readiness?.confidence ?? '-'}</p>
      <p className="text-xs text-slate-600">Governance: {readiness?.governanceState || '-'}</p>
      <p className="text-xs text-slate-600">Inference: {readiness?.inferenceLevel || '-'}</p>
      <p className="text-xs text-slate-600">Lineage: {(readiness?.evidenceLineage || []).length}</p>
    </div>
  );
}
