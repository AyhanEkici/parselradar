import React from 'react';

type Props = {
  scalingStatus?: string;
  scalingPolicy?: {
    enabled?: boolean;
    minReplicas?: number;
    maxReplicas?: number;
    cpuTarget?: number;
  };
};

export function ScalingPolicyCard({ scalingStatus, scalingPolicy }: Props) {
  return (
    <div className="rounded-lg border border-violet-200 bg-violet-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-violet-700">Scaling Policy</div>
      <div className="mt-2 text-xl font-bold text-violet-900">{scalingStatus || 'DISABLED'}</div>
      <div className="mt-2 text-sm text-violet-900">Enabled: {scalingPolicy?.enabled ? 'true' : 'false'}</div>
      <div className="mt-1 text-sm text-violet-900">Min/Max Replicas: {scalingPolicy?.minReplicas ?? '-'} / {scalingPolicy?.maxReplicas ?? '-'}</div>
      <div className="mt-1 text-sm text-violet-900">CPU Target: {scalingPolicy?.cpuTarget ?? '-'}%</div>
    </div>
  );
}
