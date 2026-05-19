import React from 'react';

export default function StrategicMonitoringCard({ strategic }: { strategic?: { index?: number; transformationIndicators?: string[]; source?: string; freshness?: number; confidence?: number; governanceState?: string; inferenceLevel?: string; evidenceLineage?: unknown[] } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Strategic Monitoring</h3>
      <p className="mt-2 text-xs text-slate-700">Transformation index: {strategic?.index ?? '-'}</p>
      <p className="text-xs text-slate-700">Indicators: {(strategic?.transformationIndicators || []).length}</p>
      <p className="text-xs text-slate-700">Source: {strategic?.source || '-'}</p>
      <p className="text-xs text-slate-700">Freshness: {strategic?.freshness ?? '-'}</p>
      <p className="text-xs text-slate-700">Confidence: {strategic?.confidence ?? '-'}</p>
      <p className="text-xs text-slate-600">Governance: {strategic?.governanceState || '-'}</p>
      <p className="text-xs text-slate-600">Inference: {strategic?.inferenceLevel || '-'}</p>
      <p className="text-xs text-slate-600">Lineage: {(strategic?.evidenceLineage || []).length}</p>
    </div>
  );
}
