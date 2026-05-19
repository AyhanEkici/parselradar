import React from 'react';

export default function RegionalCoordinationCard({ coordination }: { coordination?: { coordinationScore?: number; activeRegions?: number; dependentRegions?: number; source?: string; timestamp?: string; freshness?: number; confidence?: number; governanceState?: string; inferenceLevel?: string; executionReadiness?: string; evidenceLineage?: unknown[] } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Regional Coordination</h3>
      <p className="mt-2 text-xs text-slate-700">Coordination score: {coordination?.coordinationScore ?? '-'}</p>
      <p className="text-xs text-slate-700">Active regions: {coordination?.activeRegions ?? '-'}</p>
      <p className="text-xs text-slate-700">Dependent regions: {coordination?.dependentRegions ?? '-'}</p>
      <p className="text-xs text-slate-700">Execution readiness: {coordination?.executionReadiness || '-'}</p>
      <p className="text-xs text-slate-700">Source: {coordination?.source || '-'}</p>
      <p className="text-xs text-slate-700">Timestamp: {coordination?.timestamp || '-'}</p>
      <p className="text-xs text-slate-700">Freshness: {coordination?.freshness ?? '-'}</p>
      <p className="text-xs text-slate-700">Confidence: {coordination?.confidence ?? '-'}</p>
      <p className="text-xs text-slate-600">Governance: {coordination?.governanceState || '-'}</p>
      <p className="text-xs text-slate-600">Inference: {coordination?.inferenceLevel || '-'}</p>
      <p className="text-xs text-slate-600">Lineage: {(coordination?.evidenceLineage || []).length}</p>
    </div>
  );
}
