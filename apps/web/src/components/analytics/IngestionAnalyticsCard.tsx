import React from 'react';

type Props = { data?: any };

export default function IngestionAnalyticsCard({ data }: Props) {
  return (
    <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Ingestion Analytics</div>
      <div className="mt-2 text-sm text-cyan-900">Total Properties: {data?.totalProperties || 0}</div>
      <div className="mt-1 text-sm text-cyan-900">Stale Properties: {data?.staleProperties || 0}</div>
      <div className="mt-1 text-sm text-cyan-900">Ingestion Audits: {data?.ingestionAudits || 0}</div>
      <div className="mt-1 text-sm text-cyan-900">State: {data?.ingestionState || 'READY'}</div>
    </div>
  );
}
