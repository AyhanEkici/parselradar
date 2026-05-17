import React from 'react';

type Props = {
  runtimeStatus?: {
    state?: string;
    reason?: string;
    mode?: string;
    redisConfigured?: boolean;
    bullmqConfigured?: boolean;
  };
};

export function RuntimeStatusCard({ runtimeStatus }: Props) {
  return (
    <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Runtime Status</div>
      <div className="mt-2 text-xl font-bold text-indigo-900">{runtimeStatus?.state || 'NOT_CONFIGURED'}</div>
      <div className="mt-1 text-sm text-indigo-800">{runtimeStatus?.reason || 'Runtime status unavailable.'}</div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-indigo-700">
        <div>Mode: {runtimeStatus?.mode || '-'}</div>
        <div>Redis: {runtimeStatus?.redisConfigured ? 'configured' : 'absent'}</div>
        <div>BullMQ: {runtimeStatus?.bullmqConfigured ? 'enabled' : 'disabled'}</div>
      </div>
    </div>
  );
}
