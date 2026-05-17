import React from 'react';

type Props = {
  snapshot?: any;
};

export default function ObservabilitySnapshotCard({ snapshot }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Observability Snapshot</div>
      <div className="mt-2 text-xl font-bold text-slate-900">{snapshot?.observabilityState || 'NOT_CONFIGURED'}</div>
      <div className="mt-1 text-sm text-slate-700">Generated: {snapshot?.generatedAt ? new Date(snapshot.generatedAt).toLocaleString() : '-'}</div>
      <div className="mt-2 text-xs text-slate-600">
        Dashboard state: {snapshot?.dashboard?.dashboardState || 'DISABLED'} | Retention: {snapshot?.dashboard?.retentionDays ?? '-'} days
      </div>
    </div>
  );
}
