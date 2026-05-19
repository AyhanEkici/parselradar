import React from 'react';

export default function StrategicExposureCard({ exposure }: { exposure?: { exposureScore?: number; source?: string; timestamp?: string; freshness?: number; confidence?: number; governanceState?: string; inferenceLevel?: string; executionReadiness?: string; evidenceLineage?: unknown[] } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Strategic Exposure</h3>
      <p className="mt-2 text-xs text-slate-700">Exposure score: {exposure?.exposureScore ?? '-'}</p>
      <p className="text-xs text-slate-700">Execution readiness: {exposure?.executionReadiness || '-'}</p>
      <p className="text-xs text-slate-700">Source: {exposure?.source || '-'}</p>
      <p className="text-xs text-slate-700">Timestamp: {exposure?.timestamp || '-'}</p>
      <p className="text-xs text-slate-700">Freshness: {exposure?.freshness ?? '-'}</p>
      <p className="text-xs text-slate-700">Confidence: {exposure?.confidence ?? '-'}</p>
      <p className="text-xs text-slate-600">Governance: {exposure?.governanceState || '-'}</p>
      <p className="text-xs text-slate-600">Inference: {exposure?.inferenceLevel || '-'}</p>
      <p className="text-xs text-slate-600">Lineage: {(exposure?.evidenceLineage || []).length}</p>
    </div>
  );
}
