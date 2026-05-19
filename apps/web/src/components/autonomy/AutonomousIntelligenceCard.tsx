import React from 'react';

type Insight = {
  autonomyState?: string;
  source?: string;
  timestamp?: string;
  freshness?: number;
  confidence?: number;
  governanceState?: string;
  inferenceLevel?: string;
  evidenceLineage?: unknown[];
};

export default function AutonomousIntelligenceCard({ insight }: { insight?: Insight }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Autonomous Intelligence</h3>
      <p className="mt-2 text-xs text-slate-700">State: {insight?.autonomyState || '-'}</p>
      <p className="text-xs text-slate-700">Source: {insight?.source || '-'}</p>
      <p className="text-xs text-slate-700">Timestamp: {insight?.timestamp || '-'}</p>
      <p className="text-xs text-slate-700">Freshness: {insight?.freshness ?? '-'}</p>
      <p className="text-xs text-slate-700">Confidence: {insight?.confidence ?? '-'}</p>
      <p className="text-xs text-slate-600">Governance: {insight?.governanceState || '-'}</p>
      <p className="text-xs text-slate-600">Inference: {insight?.inferenceLevel || '-'}</p>
      <p className="text-xs text-slate-600">Lineage: {(insight?.evidenceLineage || []).length}</p>
    </div>
  );
}
