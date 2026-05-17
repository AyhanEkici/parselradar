import React from 'react';

type WorkerState = {
  name: string;
  queueName: string;
  state: string;
  reason: string;
  concurrency: number;
};

type Props = {
  workerStates?: WorkerState[];
};

export function WorkerStatusCard({ workerStates = [] }: Props) {
  return (
    <div className="rounded-lg border border-violet-200 bg-violet-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-violet-700">Worker Status</div>
      <div className="mt-3 space-y-2 text-xs">
        {workerStates.length > 0 ? workerStates.map((worker) => (
          <div key={worker.name} className="rounded border border-violet-200 bg-white p-2 text-violet-900">
            <div className="font-semibold">{worker.name}: {worker.state}</div>
            <div>Queue: {worker.queueName} | Concurrency: {worker.concurrency}</div>
            <div>{worker.reason}</div>
          </div>
        )) : <div className="text-violet-700">No worker states available.</div>}
      </div>
    </div>
  );
}
