import React from 'react';

export default function TerritorialMonitoringCard({ monitoring }: { monitoring?: { state?: string; activityScore?: number; freshness?: number; confidence?: number; governanceState?: string } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Territorial Monitoring</h3>
      <p className="mt-2 text-xs text-slate-700">State: {monitoring?.state || '-'}</p>
      <p className="text-xs text-slate-700">Activity: {monitoring?.activityScore ?? '-'}</p>
      <p className="text-xs text-slate-700">Freshness: {monitoring?.freshness ?? '-'}</p>
      <p className="text-xs text-slate-700">Confidence: {monitoring?.confidence ?? '-'}</p>
      <p className="text-xs text-slate-600">Governance: {monitoring?.governanceState || '-'}</p>
    </div>
  );
}
