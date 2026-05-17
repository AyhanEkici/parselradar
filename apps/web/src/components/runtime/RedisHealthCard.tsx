import React from 'react';

type Props = {
  redisStatus?: string;
  redisLatency?: number | null;
  distributedRuntimeEnabled?: boolean;
  fallbackMode?: 'LOCAL_FALLBACK' | 'NONE';
};

export function RedisHealthCard({ redisStatus, redisLatency, distributedRuntimeEnabled, fallbackMode }: Props) {
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-rose-700">Redis Health</div>
      <div className="mt-2 text-xl font-bold text-rose-900">{redisStatus || 'NOT_CONFIGURED'}</div>
      <div className="mt-1 text-sm text-rose-800">Latency: {typeof redisLatency === 'number' ? `${redisLatency} ms` : '-'}</div>
      <div className="mt-2 text-xs text-rose-700">Distributed: {distributedRuntimeEnabled ? 'enabled' : 'disabled'}</div>
      <div className="text-xs text-rose-700">Fallback: {fallbackMode || 'NONE'}</div>
    </div>
  );
}
