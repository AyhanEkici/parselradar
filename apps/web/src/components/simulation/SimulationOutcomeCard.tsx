import React from 'react';

export default function SimulationOutcomeCard({ outcome }: { outcome?: { outcomeScore?: number; source?: string; timestamp?: string; freshness?: number; confidence?: number; governanceState?: string; inferenceLevel?: string; executionReadiness?: string; evidenceLineage?: unknown[] } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Simulation Outcome</h3>
      <p className="mt-2 text-xs text-slate-700">Outcome score: {outcome?.outcomeScore ?? '-'}</p>
      <p className="text-xs text-slate-700">Execution readiness: {outcome?.executionReadiness || '-'}</p>
      <p className="text-xs text-slate-700">Source: {outcome?.source || '-'}</p>
      <p className="text-xs text-slate-700">Timestamp: {outcome?.timestamp || '-'}</p>
      <p className="text-xs text-slate-700">Freshness: {outcome?.freshness ?? '-'}</p>
      <p className="text-xs text-slate-700">Confidence: {outcome?.confidence ?? '-'}</p>
      <p className="text-xs text-slate-600">Governance: {outcome?.governanceState || '-'}</p>
      <p className="text-xs text-slate-600">Inference: {outcome?.inferenceLevel || '-'}</p>
      <p className="text-xs text-slate-600">Lineage: {(outcome?.evidenceLineage || []).length}</p>
    </div>
  );
}
