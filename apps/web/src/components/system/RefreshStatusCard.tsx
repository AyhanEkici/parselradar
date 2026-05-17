import React from 'react';

type Props = {
  refreshStatus?: string;
  staleFlags?: string[];
};

export const RefreshStatusCard: React.FC<Props> = ({ refreshStatus, staleFlags = [] }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Refresh Status</h3>
          <p className="mt-1 text-xs text-slate-600">Queued and stale-state visibility</p>
        </div>
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-900">
          {refreshStatus || 'unknown'}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {staleFlags.length > 0 ? staleFlags.map((flag) => (
          <span key={flag} className="rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-xs text-amber-900">
            {flag.replace(/_/g, ' ')}
          </span>
        )) : <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs text-emerald-900">no stale flags</span>}
      </div>
    </div>
  );
};
