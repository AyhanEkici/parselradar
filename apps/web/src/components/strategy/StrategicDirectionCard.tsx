import React from 'react';

export default function StrategicDirectionCard({ direction }: { direction?: { strategicDirection?: string; source?: string; timestamp?: string; freshness?: number; confidence?: number; governanceState?: string; inferenceLevel?: string; executionReadiness?: string; evidenceLineage?: unknown[] } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Strategic Direction</h3>
      <p className="mt-2 text-xs text-slate-700">Direction: {direction?.strategicDirection || '-'}</p>
      <p className="text-xs text-slate-700">Execution readiness: {direction?.executionReadiness || '-'}</p>
      <p className="text-xs text-slate-700">Source: {direction?.source || '-'}</p>
      <p className="text-xs text-slate-700">Timestamp: {direction?.timestamp || '-'}</p>
      <p className="text-xs text-slate-700">Freshness: {direction?.freshness ?? '-'}</p>
      <p className="text-xs text-slate-700">Confidence: {direction?.confidence ?? '-'}</p>
      <p className="text-xs text-slate-600">Governance: {direction?.governanceState || '-'}</p>
      <p className="text-xs text-slate-600">Inference: {direction?.inferenceLevel || '-'}</p>
      <p className="text-xs text-slate-600">Lineage: {(direction?.evidenceLineage || []).length}</p>
    </div>
  );
}
