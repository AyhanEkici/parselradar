import React from 'react';

export default function TerritorialOperatingSystemCard({ tos }: { tos?: { executionReadiness?: string; governanceState?: string; deterministic?: boolean; policy?: { humanGovernedExecutionOnly?: boolean; noHiddenAutonomousEscalation?: boolean; noFakeExecutionCertainty?: boolean }; source?: string; timestamp?: string; freshness?: number; confidence?: number; inferenceLevel?: string; evidenceLineage?: unknown[] } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Territorial Operating System</h3>
      <p className="mt-2 text-xs text-slate-700">Execution readiness: {tos?.executionReadiness || '-'}</p>
      <p className="text-xs text-slate-700">Deterministic: {tos?.deterministic ? 'yes' : 'no'}</p>
      <p className="text-xs text-slate-700">Human-governed: {tos?.policy?.humanGovernedExecutionOnly ? 'yes' : 'no'}</p>
      <p className="text-xs text-slate-700">No hidden escalation: {tos?.policy?.noHiddenAutonomousEscalation ? 'yes' : 'no'}</p>
      <p className="text-xs text-slate-700">No fake execution certainty: {tos?.policy?.noFakeExecutionCertainty ? 'yes' : 'no'}</p>
      <p className="text-xs text-slate-700">Source: {tos?.source || '-'}</p>
      <p className="text-xs text-slate-700">Timestamp: {tos?.timestamp || '-'}</p>
      <p className="text-xs text-slate-700">Freshness: {tos?.freshness ?? '-'}</p>
      <p className="text-xs text-slate-700">Confidence: {tos?.confidence ?? '-'}</p>
      <p className="text-xs text-slate-600">Governance: {tos?.governanceState || '-'}</p>
      <p className="text-xs text-slate-600">Inference: {tos?.inferenceLevel || '-'}</p>
      <p className="text-xs text-slate-600">Lineage: {(tos?.evidenceLineage || []).length}</p>
    </div>
  );
}
