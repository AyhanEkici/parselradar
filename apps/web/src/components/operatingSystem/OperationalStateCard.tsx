import React from 'react';

export default function OperationalStateCard({ state }: { state?: { operationalState?: string; source?: string; timestamp?: string; freshness?: number; confidence?: number; governanceState?: string; inferenceLevel?: string; executionReadiness?: string; evidenceLineage?: unknown[] } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Operational State</h3>
      <p className="mt-2 text-xs text-slate-700">State: {state?.operationalState || '-'}</p>
      <p className="text-xs text-slate-700">Execution readiness: {state?.executionReadiness || '-'}</p>
      <p className="text-xs text-slate-700">Source: {state?.source || '-'}</p>
      <p className="text-xs text-slate-700">Timestamp: {state?.timestamp || '-'}</p>
      <p className="text-xs text-slate-700">Freshness: {state?.freshness ?? '-'}</p>
      <p className="text-xs text-slate-700">Confidence: {state?.confidence ?? '-'}</p>
      <p className="text-xs text-slate-600">Governance: {state?.governanceState || '-'}</p>
      <p className="text-xs text-slate-600">Inference: {state?.inferenceLevel || '-'}</p>
      <p className="text-xs text-slate-600">Lineage: {(state?.evidenceLineage || []).length}</p>
    </div>
  );
}
