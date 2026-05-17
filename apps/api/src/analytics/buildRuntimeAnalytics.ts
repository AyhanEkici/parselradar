import { buildOperationalSnapshot } from '../monitoring/buildOperationalSnapshot';

export async function buildRuntimeAnalytics() {
  const snapshot = await buildOperationalSnapshot();

  return {
    runtimeStatus: snapshot.runtimeStatus?.state || 'NOT_CONFIGURED',
    queueDepthTotal: snapshot.runtimeMetrics?.queueDepthTotal || 0,
    failureRatePercent: snapshot.runtimeMetrics?.failureRatePercent || 0,
    distributedRuntimeEnabled: Boolean(snapshot.distributedRuntimeEnabled),
    runtimeAnalyticsState:
      snapshot.runtimeStatus?.state && snapshot.runtimeStatus.state !== 'NOT_CONFIGURED'
        ? 'READY'
        : 'NOT_CONFIGURED',
  };
}
