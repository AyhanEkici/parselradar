import React from 'react';

type Props = {
  audit?: any;
};

export default function ConnectorAuditTrailCard({ audit }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Connector Audit Trail</div>
      <div className="mt-2 text-sm text-slate-700">Events: {audit?.count || 0}</div>
      <div className="mt-2 max-h-56 overflow-auto space-y-2">
        {(audit?.items || []).map((item: any) => (
          <div key={item._id} className="rounded border border-slate-100 p-2 text-xs">
            <div className="font-semibold text-slate-700">{item.type}</div>
            <div className="text-slate-600">{item.message}</div>
            <div className="text-slate-500">{item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
