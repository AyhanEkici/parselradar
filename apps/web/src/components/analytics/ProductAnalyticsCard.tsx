import React from 'react';

type Props = { data?: any };

export default function ProductAnalyticsCard({ data }: Props) {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">Product Analytics</div>
      <div className="mt-2 text-sm text-blue-900">Properties: {data?.properties || 0}</div>
      <div className="mt-1 text-sm text-blue-900">Reports: {data?.reports || 0}</div>
      <div className="mt-1 text-sm text-blue-900">Analyses: {data?.analyses || 0}</div>
      <div className="mt-1 text-sm text-blue-900">State: {data?.productState || 'READY'}</div>
    </div>
  );
}
