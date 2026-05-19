import React from 'react';

export default function RegionWatchCard({ watch }: { watch?: { strategicRegionState?: string; regionalScore?: number; source?: string; freshness?: number; confidence?: number; governanceState?: string; inferenceLevel?: string; evidenceLineage?: unknown[] } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Region Watch</h3>
      <p className="mt-2 text-xs text-slate-700">Region state: {watch?.strategicRegionState || '-'}</p>
      <p className="text-xs text-slate-700">Score: {watch?.regionalScore ?? '-'}</p>
      <p className="text-xs text-slate-700">Source: {watch?.source || '-'}</p>
      <p className="text-xs text-slate-700">Freshness: {watch?.freshness ?? '-'}</p>
      <p className="text-xs text-slate-700">Confidence: {watch?.confidence ?? '-'}</p>
      <p className="text-xs text-slate-600">Governance: {watch?.governanceState || '-'}</p>
      <p className="text-xs text-slate-600">Inference: {watch?.inferenceLevel || '-'}</p>
      <p className="text-xs text-slate-600">Lineage: {(watch?.evidenceLineage || []).length}</p>
    </div>
  );
}
