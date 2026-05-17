import React from 'react';

type QueueState = {
  name: string;
  state: string;
  reason: string;
  depth: number;
  deadLetterReady: boolean;
};

type Props = {
  queueStates?: QueueState[];
};

export function QueueHealthCard({ queueStates = [] }: Props) {
  return (
    <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Queue Health</div>
      <div className="mt-3 space-y-2 text-xs">
        {queueStates.length > 0 ? queueStates.map((queue) => (
          <div key={queue.name} className="rounded border border-cyan-200 bg-white p-2 text-cyan-900">
            <div className="font-semibold">{queue.name}: {queue.state}</div>
            <div>{queue.reason}</div>
            <div>Depth: {queue.depth} | DLQ: {queue.deadLetterReady ? 'ready' : 'off'}</div>
          </div>
        )) : <div className="text-cyan-700">No queue states available.</div>}
      </div>
    </div>
  );
}
