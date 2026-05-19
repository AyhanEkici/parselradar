import React from 'react';

export default function SuppressionGovernanceCard({ suppression }: { suppression?: { activeCount?: number; activeRules?: Array<{ id?: string }>; source?: string; freshness?: number; confidence?: number; governanceState?: string; inferenceLevel?: string; evidenceLineage?: unknown[] } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Suppression Governance</h3>
      <p className="mt-2 text-xs text-slate-700">Active rules: {suppression?.activeCount ?? '-'}</p>
      <p className="text-xs text-slate-700">Rules listed: {(suppression?.activeRules || []).length}</p>
      <p className="text-xs text-slate-700">Source: {suppression?.source || '-'}</p>
      <p className="text-xs text-slate-700">Freshness: {suppression?.freshness ?? '-'}</p>
      <p className="text-xs text-slate-700">Confidence: {suppression?.confidence ?? '-'}</p>
      <p className="text-xs text-slate-600">Governance: {suppression?.governanceState || '-'}</p>
      <p className="text-xs text-slate-600">Inference: {suppression?.inferenceLevel || '-'}</p>
      <p className="text-xs text-slate-600">Lineage: {(suppression?.evidenceLineage || []).length}</p>
    </div>
  );
}
