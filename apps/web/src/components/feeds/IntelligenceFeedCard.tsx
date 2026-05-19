import React from 'react';

export default function IntelligenceFeedCard({ feed }: { feed?: { severity?: string; events?: Array<{ type?: string }>; source?: string; timestamp?: string; freshness?: number; confidence?: number; governanceState?: string; inferenceLevel?: string; evidenceLineage?: unknown[] } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Intelligence Feed</h3>
      <p className="mt-2 text-xs text-slate-700">Severity: {feed?.severity || '-'}</p>
      <p className="text-xs text-slate-700">Events: {(feed?.events || []).length}</p>
      <p className="text-xs text-slate-700">Source: {feed?.source || '-'}</p>
      <p className="text-xs text-slate-700">Timestamp: {feed?.timestamp || '-'}</p>
      <p className="text-xs text-slate-700">Freshness: {feed?.freshness ?? '-'}</p>
      <p className="text-xs text-slate-700">Confidence: {feed?.confidence ?? '-'}</p>
      <p className="text-xs text-slate-600">Governance: {feed?.governanceState || '-'}</p>
      <p className="text-xs text-slate-600">Inference: {feed?.inferenceLevel || '-'}</p>
      <p className="text-xs text-slate-600">Lineage: {(feed?.evidenceLineage || []).length}</p>
    </div>
  );
}
