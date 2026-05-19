"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveTelemetryProviderState = resolveTelemetryProviderState;
const telemetryProviders_1 = require("../config/observability/telemetryProviders");
function resolveTelemetryProviderState() {
    const providers = (0, telemetryProviders_1.resolveTelemetryProviders)();
    return {
        sentry: providers.sentry,
        datadog: providers.datadog,
        openTelemetry: providers.openTelemetry,
        prometheus: providers.prometheus,
    };
}
