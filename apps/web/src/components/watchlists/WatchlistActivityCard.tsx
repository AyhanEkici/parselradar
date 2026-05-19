import React from 'react';

export default function WatchlistActivityCard({ watchlist }: { watchlist?: { signalCount?: number; watchState?: string; source?: string; freshness?: number; confidence?: number; governanceState?: string; inferenceLevel?: string; evidenceLineage?: unknown[] } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Watchlist Activity</h3>
      <p className="mt-2 text-xs text-slate-700">State: {watchlist?.watchState || '-'}</p>
      <p className="text-xs text-slate-700">Signals: {watchlist?.signalCount ?? '-'}</p>
      <p className="text-xs text-slate-700">Source: {watchlist?.source || '-'}</p>
      <p className="text-xs text-slate-700">Freshness: {watchlist?.freshness ?? '-'}</p>
      <p className="text-xs text-slate-700">Confidence: {watchlist?.confidence ?? '-'}</p>
      <p className="text-xs text-slate-600">Governance: {watchlist?.governanceState || '-'}</p>
      <p className="text-xs text-slate-600">Inference: {watchlist?.inferenceLevel || '-'}</p>
      <p className="text-xs text-slate-600">Lineage: {(watchlist?.evidenceLineage || []).length}</p>
    </div>
  );
}
