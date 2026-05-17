import React from 'react';

type Snapshot = {
  connector: string;
  status: 'NOT_CONFIGURED' | 'MOCK_DISABLED' | 'READY' | 'FAILED' | 'STALE' | 'LIVE' | string;
  reason?: string;
};

type Props = {
  connectorStatus?: {
    networkState?: string;
    snapshots?: Snapshot[];
    statusCounts?: Record<string, number>;
  };
};

export const ConnectorStatusCard: React.FC<Props> = ({ connectorStatus }) => {
  const snapshots = connectorStatus?.snapshots || [];

  return (
    <div className="h-full rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">Connector Status</div>
      <div className="mt-2 text-lg font-bold text-slate-900">{connectorStatus?.networkState || 'unknown'}</div>
      <div className="mt-3 space-y-2 text-xs text-slate-700">
        {snapshots.length > 0 ? snapshots.map((item) => (
          <div key={item.connector} className="rounded-md border border-slate-200 bg-white p-2">
            <div className="font-semibold">{item.connector}: {item.status}</div>
            <div className="text-slate-600">{item.reason || '-'}</div>
          </div>
        )) : <div>No connector snapshots</div>}
      </div>
    </div>
  );
};
