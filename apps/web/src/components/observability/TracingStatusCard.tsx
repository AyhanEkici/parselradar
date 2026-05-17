import React from 'react';

type Props = {
  tracing?: any;
};

export default function TracingStatusCard({ tracing }: Props) {
  return (
    <div className="rounded-lg border border-violet-200 bg-violet-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-violet-700">Tracing Status</div>
      <div className="mt-2 text-xl font-bold text-violet-900">{tracing?.tracingState || 'NOT_CONFIGURED'}</div>
      <div className="mt-1 text-sm text-violet-900">Enabled: {tracing?.enabled ? 'true' : 'false'}</div>
      <div className="mt-1 text-sm text-violet-900">Endpoint Configured: {tracing?.endpointConfigured ? 'true' : 'false'}</div>
      <div className="mt-1 text-sm text-violet-900">Sample Rate: {tracing?.sampleRate ?? '-'}</div>
    </div>
  );
}
