import React from 'react';

export default function TucbsConnectorCard({ data }: { data: any }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">TUCBS Connector</h3>
      <div className="mt-2 space-y-1 text-xs text-slate-700">
        <div>Provider: {data?.provider || '-'}</div>
        <div>Mode: {data?.mode || '-'}</div>
        <div>State: {data?.activationState?.state || '-'}</div>
        <div>Layer count: {data?.diagnostics?.layerCount ?? 0}</div>
        <div>Availability: {data?.diagnostics?.availability || '-'}</div>
      </div>
    </div>
  );
}
