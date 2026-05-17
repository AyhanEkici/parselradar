import { resolveTelemetryProviders } from '../config/observability/telemetryProviders';

export function buildTelemetryState() {
  const providers = resolveTelemetryProviders();
  const states = [
    providers.sentry.state,
    providers.datadog.state,
    providers.openTelemetry.state,
    providers.prometheus.state,
  ];

  const activeLike = states.filter((s) => s === 'READY').length;
  const telemetryState = activeLike > 0 ? 'READY' : 'NOT_CONFIGURED';

  return {
    telemetryState,
    providers,
  };
}
