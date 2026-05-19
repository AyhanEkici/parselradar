"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTelemetryState = buildTelemetryState;
const telemetryProviders_1 = require("../config/observability/telemetryProviders");
function buildTelemetryState() {
    const providers = (0, telemetryProviders_1.resolveTelemetryProviders)();
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
