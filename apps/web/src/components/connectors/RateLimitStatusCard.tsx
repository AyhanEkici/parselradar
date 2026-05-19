import React from 'react';

export default function RateLimitStatusCard({
  quota,
}: {
  quota?: Array<{ connectorKey: string; used: number; quota: number; nearLimit: boolean }>;
}) {
  const rows = quota || [];
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-800">Rate Limit Status</h3>
      <div className="mt-2 space-y-2 text-xs text-gray-700">
        {rows.slice(0, 8).map((row) => (
          <div key={row.connectorKey} className="rounded bg-gray-50 px-2 py-1">
            {row.connectorKey}: {row.used}/{row.quota} {row.nearLimit ? '(near limit)' : ''}
          </div>
        ))}
      </div>
    </div>
  );
}
