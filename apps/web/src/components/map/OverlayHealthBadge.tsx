import React from 'react';

export default function OverlayHealthBadge({ status, latencyMs }: { status: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE'; latencyMs?: number }) {
  const tone =
    status === 'HEALTHY'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : status === 'DEGRADED'
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : 'border-rose-200 bg-rose-50 text-rose-700';

  return (
    <span className={`inline-flex items-center gap-2 rounded border px-2 py-1 text-xs font-semibold ${tone}`}>
      <span>{status}</span>
      {typeof latencyMs === 'number' ? <span>{Math.round(latencyMs)}ms</span> : null}
    </span>
  );
}
