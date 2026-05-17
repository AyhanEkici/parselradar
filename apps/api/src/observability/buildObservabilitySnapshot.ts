import { buildTelemetryHealth } from './buildTelemetryHealth';
import { buildTracingSnapshot } from './buildTracingSnapshot';
import { buildProductionAlertState } from './buildProductionAlertState';
import { buildErrorAnalytics } from './buildErrorAnalytics';
import { resolveDashboardPolicy } from '../config/observability/dashboardPolicies';

export async function buildObservabilitySnapshot() {
  const telemetry = buildTelemetryHealth();
  const tracing = buildTracingSnapshot();
  const productionAlerts = buildProductionAlertState();
  const errorAnalytics = await buildErrorAnalytics();
  const dashboard = resolveDashboardPolicy();

  return {
    generatedAt: new Date().toISOString(),
    observabilityState:
      telemetry.telemetryState === 'NOT_CONFIGURED' && tracing.tracingState === 'NOT_CONFIGURED'
        ? 'NOT_CONFIGURED'
        : errorAnalytics.errorState === 'DEGRADED'
        ? 'DEGRADED'
        : 'READY',
    telemetry,
    tracing,
    productionAlerts,
    errorAnalytics,
    dashboard,
  };
}
