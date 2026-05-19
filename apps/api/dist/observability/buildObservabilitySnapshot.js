"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildObservabilitySnapshot = buildObservabilitySnapshot;
const buildTelemetryHealth_1 = require("./buildTelemetryHealth");
const buildTracingSnapshot_1 = require("./buildTracingSnapshot");
const buildProductionAlertState_1 = require("./buildProductionAlertState");
const buildErrorAnalytics_1 = require("./buildErrorAnalytics");
const dashboardPolicies_1 = require("../config/observability/dashboardPolicies");
async function buildObservabilitySnapshot() {
    const telemetry = (0, buildTelemetryHealth_1.buildTelemetryHealth)();
    const tracing = (0, buildTracingSnapshot_1.buildTracingSnapshot)();
    const productionAlerts = (0, buildProductionAlertState_1.buildProductionAlertState)();
    const errorAnalytics = await (0, buildErrorAnalytics_1.buildErrorAnalytics)();
    const dashboard = (0, dashboardPolicies_1.resolveDashboardPolicy)();
    return {
        generatedAt: new Date().toISOString(),
        observabilityState: telemetry.telemetryState === 'NOT_CONFIGURED' && tracing.tracingState === 'NOT_CONFIGURED'
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
