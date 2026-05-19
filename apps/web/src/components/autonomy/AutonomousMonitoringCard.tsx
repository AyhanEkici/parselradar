import React from 'react';

export default function AutonomousMonitoringCard({ monitor }: { monitor?: { autonomyState?: string; source?: string; timestamp?: string; freshness?: number; confidence?: number; governanceState?: string; inferenceLevel?: string; evidenceLineage?: unknown[] } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Autonomous Monitoring</h3>
      <p className="mt-2 text-xs text-slate-700">State: {monitor?.autonomyState || '-'}</p>
      <p className="text-xs text-slate-700">Source: {monitor?.source || '-'}</p>
      <p className="text-xs text-slate-700">Timestamp: {monitor?.timestamp || '-'}</p>
      <p className="text-xs text-slate-700">Freshness: {monitor?.freshness ?? '-'}</p>
      <p className="text-xs text-slate-700">Confidence: {monitor?.confidence ?? '-'}</p>
      <p className="text-xs text-slate-600">Governance: {monitor?.governanceState || '-'}</p>
      <p className="text-xs text-slate-600">Inference: {monitor?.inferenceLevel || '-'}</p>
      <p className="text-xs text-slate-600">Lineage: {(monitor?.evidenceLineage || []).length}</p>
    </div>
  );
}
