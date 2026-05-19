import React from 'react';

export default function ReviewQueueCard({ queue }: { queue?: { queueDepth?: number; items?: Array<{ id?: string; reason?: string }>; source?: string; freshness?: number; confidence?: number; governanceState?: string; inferenceLevel?: string; evidenceLineage?: unknown[] } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Autonomy Review Queue</h3>
      <p className="mt-2 text-xs text-slate-700">Queue depth: {queue?.queueDepth ?? '-'}</p>
      <p className="text-xs text-slate-700">Items: {(queue?.items || []).length}</p>
      <p className="text-xs text-slate-700">Source: {queue?.source || '-'}</p>
      <p className="text-xs text-slate-700">Freshness: {queue?.freshness ?? '-'}</p>
      <p className="text-xs text-slate-700">Confidence: {queue?.confidence ?? '-'}</p>
      <p className="text-xs text-slate-600">Governance: {queue?.governanceState || '-'}</p>
      <p className="text-xs text-slate-600">Inference: {queue?.inferenceLevel || '-'}</p>
      <p className="text-xs text-slate-600">Lineage: {(queue?.evidenceLineage || []).length}</p>
    </div>
  );
}
