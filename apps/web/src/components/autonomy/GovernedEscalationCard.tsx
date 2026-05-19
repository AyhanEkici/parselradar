import React from 'react';

export default function GovernedEscalationCard({ escalation }: { escalation?: { status?: string; queueDepth?: number; source?: string; timestamp?: string; freshness?: number; confidence?: number; governanceState?: string; inferenceLevel?: string; evidenceLineage?: unknown[] } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Governed Escalation</h3>
      <p className="mt-2 text-xs text-slate-700">Status: {escalation?.status || '-'}</p>
      <p className="text-xs text-slate-700">Queue depth: {escalation?.queueDepth ?? '-'}</p>
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
