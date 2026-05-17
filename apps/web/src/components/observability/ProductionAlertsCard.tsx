import React from 'react';

type Props = {
  productionAlerts?: any;
};

export default function ProductionAlertsCard({ productionAlerts }: Props) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">Production Alerting</div>
      <div className="mt-2 text-xl font-bold text-amber-900">{productionAlerts?.productionAlertState || 'NOT_CONFIGURED'}</div>
      <div className="mt-1 text-sm text-amber-900">Alerting Enabled: {productionAlerts?.alerting?.alertingEnabled ? 'true' : 'false'}</div>
      <div className="mt-1 text-sm text-amber-900">Webhook Configured: {productionAlerts?.alerting?.webhookConfigured ? 'true' : 'false'}</div>
    </div>
  );
}
