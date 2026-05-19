import React from 'react';

export default function StrategicRegionCard({ region }: { region?: { strategicRegionState?: string; strategicScore?: number; source?: string; freshness?: number; confidence?: number; governanceState?: string; inferenceLevel?: string; evidenceLineage?: unknown[] } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Strategic Region</h3>
      <p className="mt-2 text-xs text-slate-700">State: {region?.strategicRegionState || '-'}</p>
      <p className="text-xs text-slate-700">Score: {region?.strategicScore ?? '-'}</p>
      <p className="text-xs text-slate-700">Source: {region?.source || '-'}</p>
      <p className="text-xs text-slate-700">Freshness: {region?.freshness ?? '-'}</p>
      <p className="text-xs text-slate-700">Confidence: {region?.confidence ?? '-'}</p>
      <p className="text-xs text-slate-600">Governance: {region?.governanceState || '-'}</p>
      <p className="text-xs text-slate-600">Inference: {region?.inferenceLevel || '-'}</p>
      <p className="text-xs text-slate-600">Lineage: {(region?.evidenceLineage || []).length}</p>
    </div>
  );
}
