import React from 'react';

type Props = {
  connector: any;
};

export default function ConnectorStatusCard({ connector }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Connector Status</div>
      <div className="mt-2 text-lg font-bold text-slate-900">{connector?.name || connector?.key || '-'}</div>
      <div className="mt-1 text-sm text-slate-700">State: {connector?.state || connector?.status?.state || 'NOT_CONFIGURED'}</div>
      <div className="mt-1 text-sm text-slate-700">Category: {connector?.category || '-'}</div>
    </div>
  );
}
