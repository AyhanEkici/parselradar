import React from 'react';

type Props = {
  telemetry?: any;
};

export default function TelemetryStatusCard({ telemetry }: Props) {
  return (
    <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-sky-700">Telemetry Status</div>
      <div className="mt-2 text-xl font-bold text-sky-900">{telemetry?.telemetryState || 'NOT_CONFIGURED'}</div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-sky-800">
        <div>Sentry: {telemetry?.providers?.sentry?.state || 'NOT_CONFIGURED'}</div>
        <div>Datadog: {telemetry?.providers?.datadog?.state || 'NOT_CONFIGURED'}</div>
        <div>OpenTelemetry: {telemetry?.providers?.openTelemetry?.state || 'NOT_CONFIGURED'}</div>
        <div>Prometheus: {telemetry?.providers?.prometheus?.state || 'NOT_CONFIGURED'}</div>
      </div>
    </div>
  );
}
