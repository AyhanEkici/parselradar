import { resolveTelemetryProviders } from '../config/observability/telemetryProviders';

export function resolveTelemetryProviderState() {
  const providers = resolveTelemetryProviders();
  return {
    sentry: providers.sentry,
    datadog: providers.datadog,
    openTelemetry: providers.openTelemetry,
    prometheus: providers.prometheus,
  };
}
