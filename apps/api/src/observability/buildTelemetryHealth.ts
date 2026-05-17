import { buildTelemetryState } from '../telemetry/telemetryState';
import { resolveMetricsPolicy } from '../config/observability/metricsPolicies';

export function buildTelemetryHealth() {
  const telemetry = buildTelemetryState();
  const metrics = resolveMetricsPolicy();

  return {
    telemetryState: telemetry.telemetryState,
    providers: telemetry.providers,
    metricsState: metrics.metricsState,
    metrics,
  };
}
