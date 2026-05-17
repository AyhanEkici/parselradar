import React from 'react';

type QueueMetric = {
  queue: string;
  pending: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  retrying: number;
  backend: 'DISTRIBUTED' | 'LOCAL_FALLBACK' | string;
};

type Props = {
  queueMetrics?: QueueMetric[];
};

export function QueueMetricsCard({ queueMetrics = [] }: Props) {
  return (
    <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Queue Metrics</div>
      <div className="mt-3 space-y-2 text-xs text-cyan-900">
        {queueMetrics.length > 0 ? queueMetrics.map((item) => (
          <div key={item.queue} className="rounded border border-cyan-200 bg-white p-2">
            <div className="font-semibold">{item.queue} ({item.backend})</div>
            <div>P:{item.pending} A:{item.active} C:{item.completed} F:{item.failed} D:{item.delayed} R:{item.retrying}</div>
          </div>
        )) : <div className="text-cyan-700">No queue metrics available.</div>}
      </div>
    </div>
  );
}
