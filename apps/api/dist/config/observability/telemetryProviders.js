"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveTelemetryProviders = resolveTelemetryProviders;
function resolveTelemetryProviders() {
    const sentryDsn = process.env.SENTRY_DSN || '';
    const datadogApiKey = process.env.DATADOG_API_KEY || '';
    const otelEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || '';
    const promEndpoint = process.env.PROMETHEUS_PUSHGATEWAY || '';
    const sentryState = sentryDsn ? 'READY' : 'NOT_CONFIGURED';
    const datadogState = datadogApiKey ? 'READY' : 'NOT_CONFIGURED';
    const openTelemetryState = otelEndpoint ? 'READY' : 'NOT_CONFIGURED';
    const prometheusState = promEndpoint ? 'READY' : 'NOT_CONFIGURED';
    return {
        sentry: { state: sentryState, configured: Boolean(sentryDsn) },
        datadog: { state: datadogState, configured: Boolean(datadogApiKey) },
        openTelemetry: { state: openTelemetryState, configured: Boolean(otelEndpoint) },
        prometheus: { state: prometheusState, configured: Boolean(promEndpoint) },
    };
}
