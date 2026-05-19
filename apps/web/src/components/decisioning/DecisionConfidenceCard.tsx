import React from 'react';

export default function DecisionConfidenceCard({ decision }: { decision?: { decisionConfidence?: string; decisionConfidenceScore?: number; source?: string; timestamp?: string; freshness?: number; confidence?: number; governanceState?: string; inferenceLevel?: string; executionReadiness?: string; evidenceLineage?: unknown[] } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Decision Confidence</h3>
      <p className="mt-2 text-xs text-slate-700">Confidence class: {decision?.decisionConfidence || '-'}</p>
      <p className="text-xs text-slate-700">Score: {decision?.decisionConfidenceScore ?? '-'}</p>
      <p className="text-xs text-slate-700">Execution readiness: {decision?.executionReadiness || '-'}</p>
      <p className="text-xs text-slate-700">Source: {decision?.source || '-'}</p>
      <p className="text-xs text-slate-700">Timestamp: {decision?.timestamp || '-'}</p>
      <p className="text-xs text-slate-700">Freshness: {decision?.freshness ?? '-'}</p>
      <p className="text-xs text-slate-700">Confidence: {decision?.confidence ?? '-'}</p>
      <p className="text-xs text-slate-600">Governance: {decision?.governanceState || '-'}</p>
      <p className="text-xs text-slate-600">Inference: {decision?.inferenceLevel || '-'}</p>
      <p className="text-xs text-slate-600">Lineage: {(decision?.evidenceLineage || []).length}</p>
    </div>
  );
}
