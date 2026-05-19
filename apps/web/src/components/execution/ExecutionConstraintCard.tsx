import React from 'react';

export default function ExecutionConstraintCard({ constraint }: { constraint?: { constraintScore?: number; constraints?: { connectorDegradedCount?: number; legalRestrictionCount?: number; dependencyHotspots?: number }; source?: string; timestamp?: string; freshness?: number; confidence?: number; governanceState?: string; inferenceLevel?: string; executionReadiness?: string; evidenceLineage?: unknown[] } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Execution Constraints</h3>
      <p className="mt-2 text-xs text-slate-700">Constraint score: {constraint?.constraintScore ?? '-'}</p>
      <p className="text-xs text-slate-700">Degraded connectors: {constraint?.constraints?.connectorDegradedCount ?? '-'}</p>
      <p className="text-xs text-slate-700">Legal restrictions: {constraint?.constraints?.legalRestrictionCount ?? '-'}</p>
      <p className="text-xs text-slate-700">Dependency hotspots: {constraint?.constraints?.dependencyHotspots ?? '-'}</p>
      <p className="text-xs text-slate-700">Execution readiness: {constraint?.executionReadiness || '-'}</p>
      <p className="text-xs text-slate-700">Source: {constraint?.source || '-'}</p>
      <p className="text-xs text-slate-700">Timestamp: {constraint?.timestamp || '-'}</p>
      <p className="text-xs text-slate-700">Freshness: {constraint?.freshness ?? '-'}</p>
      <p className="text-xs text-slate-700">Confidence: {constraint?.confidence ?? '-'}</p>
      <p className="text-xs text-slate-600">Governance: {constraint?.governanceState || '-'}</p>
      <p className="text-xs text-slate-600">Inference: {constraint?.inferenceLevel || '-'}</p>
      <p className="text-xs text-slate-600">Lineage: {(constraint?.evidenceLineage || []).length}</p>
    </div>
  );
}
