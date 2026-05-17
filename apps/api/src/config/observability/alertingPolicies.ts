export function resolveAlertingPolicy() {
  const alertingEnabled = process.env.ALERTING_ENABLED === 'true';
  const webhookConfigured = Boolean(process.env.ALERT_WEBHOOK_URL);

  const productionAlertState = !alertingEnabled
    ? 'DISABLED'
    : webhookConfigured
    ? 'READY'
    : 'NOT_CONFIGURED';

  return {
    productionAlertState,
    alertingEnabled,
    webhookConfigured,
  };
}
