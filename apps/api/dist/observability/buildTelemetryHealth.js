"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTelemetryHealth = buildTelemetryHealth;
const telemetryState_1 = require("../telemetry/telemetryState");
const metricsPolicies_1 = require("../config/observability/metricsPolicies");
function buildTelemetryHealth() {
    const telemetry = (0, telemetryState_1.buildTelemetryState)();
    const metrics = (0, metricsPolicies_1.resolveMetricsPolicy)();
    return {
        telemetryState: telemetry.telemetryState,
        providers: telemetry.providers,
        metricsState: metrics.metricsState,
        metrics,
    };
}
