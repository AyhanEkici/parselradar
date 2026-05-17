import React from 'react';

type SecuritySignal = {
  level: 'low' | 'medium' | 'high' | string;
  type: string;
  message: string;
  fingerprint?: string;
};

type Props = {
  securitySignals?: SecuritySignal[];
};

export function SecurityHealthCard({ securitySignals = [] }: Props) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">Security Health</div>
      <div className="mt-3 space-y-2 text-xs">
        {securitySignals.length > 0 ? securitySignals.map((signal, idx) => (
          <div key={`${signal.type}-${idx}`} className="rounded border border-amber-200 bg-white p-2 text-amber-900">
            <div className="font-semibold">{signal.level.toUpperCase()} - {signal.type}</div>
            <div>{signal.message}</div>
            <div>{signal.fingerprint ? `Fingerprint: ${signal.fingerprint}` : 'Fingerprint: -'}</div>
          </div>
        )) : <div className="text-amber-700">No security signals detected.</div>}
      </div>
    </div>
  );
}
