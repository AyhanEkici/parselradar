export type ObservabilityState =
  | 'NOT_CONFIGURED'
  | 'DISABLED'
  | 'READY'
  | 'ACTIVE'
  | 'DEGRADED'
  | 'FAILED';

export function resolveTelemetryProviders() {
  const sentryDsn = process.env.SENTRY_DSN || '';
  const datadogApiKey = process.env.DATADOG_API_KEY || '';
  const otelEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || '';
  const promEndpoint = process.env.PROMETHEUS_PUSHGATEWAY || '';

  const sentryState: ObservabilityState = sentryDsn ? 'READY' : 'NOT_CONFIGURED';
  const datadogState: ObservabilityState = datadogApiKey ? 'READY' : 'NOT_CONFIGURED';
  const openTelemetryState: ObservabilityState = otelEndpoint ? 'READY' : 'NOT_CONFIGURED';
  const prometheusState: ObservabilityState = promEndpoint ? 'READY' : 'NOT_CONFIGURED';

  return {
    sentry: { state: sentryState, configured: Boolean(sentryDsn) },
    datadog: { state: datadogState, configured: Boolean(datadogApiKey) },
    openTelemetry: { state: openTelemetryState, configured: Boolean(otelEndpoint) },
    prometheus: { state: prometheusState, configured: Boolean(promEndpoint) },
  };
}
