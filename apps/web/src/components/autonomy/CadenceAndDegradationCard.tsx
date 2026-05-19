import React from 'react';

export default function CadenceAndDegradationCard({ cadence, degradation }: { cadence?: { cadenceMinutes?: number; source?: string; freshness?: number; confidence?: number; governanceState?: string; inferenceLevel?: string; evidenceLineage?: unknown[] }; degradation?: { staleConnectorCount?: number; degraded?: boolean; source?: string; freshness?: number; confidence?: number; governanceState?: string; inferenceLevel?: string; evidenceLineage?: unknown[] } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Cadence and Degradation</h3>
      <p className="mt-2 text-xs text-slate-700">Cadence minutes: {cadence?.cadenceMinutes ?? '-'}</p>
      <p className="text-xs text-slate-700">Degraded connectors: {degradation?.staleConnectorCount ?? '-'}</p>
      <p className="text-xs text-slate-700">Degraded state: {degradation?.degraded ? 'yes' : 'no'}</p>
      <p className="text-xs text-slate-700">Source: {cadence?.source || degradation?.source || '-'}</p>
      <p className="text-xs text-slate-700">Freshness: {cadence?.freshness ?? degradation?.freshness ?? '-'}</p>
      <p className="text-xs text-slate-700">Confidence: {cadence?.confidence ?? degradation?.confidence ?? '-'}</p>
      <p className="text-xs text-slate-600">Governance: {cadence?.governanceState || degradation?.governanceState || '-'}</p>
      <p className="text-xs text-slate-600">Inference: {cadence?.inferenceLevel || degradation?.inferenceLevel || '-'}</p>
      <p className="text-xs text-slate-600">Lineage: {Math.max((cadence?.evidenceLineage || []).length, (degradation?.evidenceLineage || []).length)}</p>
    </div>
  );
}
