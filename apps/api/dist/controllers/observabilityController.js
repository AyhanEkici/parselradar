"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminAnalytics = exports.getAdminTelemetry = exports.getAdminObservability = void 0;
const buildObservabilitySnapshot_1 = require("../observability/buildObservabilitySnapshot");
const telemetryState_1 = require("../telemetry/telemetryState");
const metricsCollector_1 = require("../telemetry/metricsCollector");
const tracingPolicies_1 = require("../config/observability/tracingPolicies");
const buildProductAnalytics_1 = require("../analytics/buildProductAnalytics");
const buildIngestionAnalytics_1 = require("../analytics/buildIngestionAnalytics");
const buildRuntimeAnalytics_1 = require("../analytics/buildRuntimeAnalytics");
const buildInvestorAnalytics_1 = require("../analytics/buildInvestorAnalytics");
const buildWorkspaceAnalytics_1 = require("../analytics/buildWorkspaceAnalytics");
const getAdminObservability = async (_req, res) => {
    const snapshot = await (0, buildObservabilitySnapshot_1.buildObservabilitySnapshot)();
    return res.json(snapshot);
};
exports.getAdminObservability = getAdminObservability;
const getAdminTelemetry = async (_req, res) => {
    const telemetry = (0, telemetryState_1.buildTelemetryState)();
    const metrics = await (0, metricsCollector_1.collectTelemetryMetrics)();
    const tracing = (0, tracingPolicies_1.resolveTracingPolicy)();
    return res.json({
        telemetryState: telemetry.telemetryState,
        providers: telemetry.providers,
        tracing,
        metrics,
        generatedAt: new Date().toISOString(),
    });
};
exports.getAdminTelemetry = getAdminTelemetry;
const getAdminAnalytics = async (_req, res) => {
    const [product, ingestion, runtime, investor, workspace] = await Promise.all([
        (0, buildProductAnalytics_1.buildProductAnalytics)(),
        (0, buildIngestionAnalytics_1.buildIngestionAnalytics)(),
        (0, buildRuntimeAnalytics_1.buildRuntimeAnalytics)(),
        (0, buildInvestorAnalytics_1.buildInvestorAnalytics)(),
        (0, buildWorkspaceAnalytics_1.buildWorkspaceAnalytics)(),
    ]);
    return res.json({
        generatedAt: new Date().toISOString(),
        product,
        ingestion,
        runtime,
        investor,
        workspace,
    });
};
exports.getAdminAnalytics = getAdminAnalytics;
