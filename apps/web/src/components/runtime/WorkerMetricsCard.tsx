import React from 'react';

type WorkerMetric = {
  worker: string;
  processed: number;
  failed: number;
  restarted: number;
  running: boolean;
};

type Props = {
  workerMetrics?: WorkerMetric[];
};

export function WorkerMetricsCard({ workerMetrics = [] }: Props) {
  return (
    <div className="rounded-lg border border-violet-200 bg-violet-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-violet-700">Worker Metrics</div>
      <div className="mt-3 space-y-2 text-xs text-violet-900">
        {workerMetrics.length > 0 ? workerMetrics.map((item) => (
          <div key={item.worker} className="rounded border border-violet-200 bg-white p-2">
            <div className="font-semibold">{item.worker} ({item.running ? 'running' : 'idle'})</div>
            <div>Processed: {item.processed} | Failed: {item.failed} | Restarted: {item.restarted}</div>
          </div>
        )) : <div className="text-violet-700">No worker metrics available.</div>}
      </div>
    </div>
  );
}
