import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { buildObservabilitySnapshot } from '../observability/buildObservabilitySnapshot';
import { buildTelemetryState } from '../telemetry/telemetryState';
import { collectTelemetryMetrics } from '../telemetry/metricsCollector';
import { resolveTracingPolicy } from '../config/observability/tracingPolicies';
import { buildProductAnalytics } from '../analytics/buildProductAnalytics';
import { buildIngestionAnalytics } from '../analytics/buildIngestionAnalytics';
import { buildRuntimeAnalytics } from '../analytics/buildRuntimeAnalytics';
import { buildInvestorAnalytics } from '../analytics/buildInvestorAnalytics';
import { buildWorkspaceAnalytics } from '../analytics/buildWorkspaceAnalytics';

export const getAdminObservability = async (_req: AuthRequest, res: Response) => {
  const snapshot = await buildObservabilitySnapshot();
  return res.json(snapshot);
};

export const getAdminTelemetry = async (_req: AuthRequest, res: Response) => {
  const telemetry = buildTelemetryState();
  const metrics = await collectTelemetryMetrics();
  const tracing = resolveTracingPolicy();

  return res.json({
    telemetryState: telemetry.telemetryState,
    providers: telemetry.providers,
    tracing,
    metrics,
    generatedAt: new Date().toISOString(),
  });
};

export const getAdminAnalytics = async (_req: AuthRequest, res: Response) => {
  const [product, ingestion, runtime, investor, workspace] = await Promise.all([
    buildProductAnalytics(),
    buildIngestionAnalytics(),
    buildRuntimeAnalytics(),
    buildInvestorAnalytics(),
    buildWorkspaceAnalytics(),
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
