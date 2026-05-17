import React from 'react';

type Props = {
  throughput?: {
    analysisPerHour?: number;
    refreshPerHour?: number;
  };
};

export function ThroughputCard({ throughput }: Props) {
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Throughput</div>
      <div className="mt-2 text-sm text-emerald-900">Analysis per hour: {throughput?.analysisPerHour ?? 0}</div>
      <div className="text-sm text-emerald-900">Refresh per hour: {throughput?.refreshPerHour ?? 0}</div>
    </div>
  );
}
