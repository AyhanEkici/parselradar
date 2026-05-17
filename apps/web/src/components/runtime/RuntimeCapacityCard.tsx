import React from 'react';

type Props = {
  runtimeCapacity?: {
    cpuCount?: number;
    memoryMb?: number;
    nodeEnv?: string;
    status?: string;
  };
};

export function RuntimeCapacityCard({ runtimeCapacity }: Props) {
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Runtime Capacity</div>
      <div className="mt-2 text-sm text-emerald-900">CPU: {runtimeCapacity?.cpuCount ?? '-'}</div>
      <div className="mt-1 text-sm text-emerald-900">Memory MB: {runtimeCapacity?.memoryMb ?? '-'}</div>
      <div className="mt-1 text-sm text-emerald-900">Env: {runtimeCapacity?.nodeEnv || '-'}</div>
      <div className="mt-1 text-xs text-emerald-700">{runtimeCapacity?.status || '-'}</div>
    </div>
  );
}
