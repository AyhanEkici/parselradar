import React from 'react';

export default function ParcelWatchlistCard({ watch }: { watch?: { watchState?: string; signalCount?: number; source?: string; freshness?: number; confidence?: number; governanceState?: string; inferenceLevel?: string; evidenceLineage?: unknown[] } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Parcel Watchlist</h3>
      <p className="mt-2 text-xs text-slate-700">Watch state: {watch?.watchState || '-'}</p>
      <p className="text-xs text-slate-700">Signals: {watch?.signalCount ?? '-'}</p>
      <p className="text-xs text-slate-700">Source: {watch?.source || '-'}</p>
      <p className="text-xs text-slate-700">Freshness: {watch?.freshness ?? '-'}</p>
      <p className="text-xs text-slate-700">Confidence: {watch?.confidence ?? '-'}</p>
      <p className="text-xs text-slate-600">Governance: {watch?.governanceState || '-'}</p>
      <p className="text-xs text-slate-600">Inference: {watch?.inferenceLevel || '-'}</p>
      <p className="text-xs text-slate-600">Lineage: {(watch?.evidenceLineage || []).length}</p>
    </div>
  );
}
