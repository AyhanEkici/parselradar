import React from 'react';

export default function EscalationTimelineCard({ escalation }: { escalation?: { status?: string; queueDepth?: number; items?: Array<{ id?: string; severity?: string }>; source?: string; timestamp?: string; freshness?: number; confidence?: number; governanceState?: string; inferenceLevel?: string; evidenceLineage?: unknown[] } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Escalation Timeline</h3>
      <p className="mt-2 text-xs text-slate-700">Status: {escalation?.status || '-'}</p>
      <p className="text-xs text-slate-700">Queue depth: {escalation?.queueDepth ?? '-'}</p>
      <p className="text-xs text-slate-700">Items: {(escalation?.items || []).length}</p>
      <p className="text-xs text-slate-700">Source: {escalation?.source || '-'}</p>
      <p className="text-xs text-slate-700">Timestamp: {escalation?.timestamp || '-'}</p>
      <p className="text-xs text-slate-700">Freshness: {escalation?.freshness ?? '-'}</p>
      <p className="text-xs text-slate-700">Confidence: {escalation?.confidence ?? '-'}</p>
      <p className="text-xs text-slate-600">Governance: {escalation?.governanceState || '-'}</p>
      <p className="text-xs text-slate-600">Inference: {escalation?.inferenceLevel || '-'}</p>
      <p className="text-xs text-slate-600">Lineage: {(escalation?.evidenceLineage || []).length}</p>
    </div>
  );
}
