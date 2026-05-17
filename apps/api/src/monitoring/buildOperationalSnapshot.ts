import { getQueueMetrics } from '../runtime/queueFactory';
import { getRuntimeConfig } from '../runtime/runtimeConfig';
import { buildRuntimeManagerSnapshot } from '../runtime/runtimeManager';
import { OperationalSnapshot } from '../runtime/runtimeState';
import { getWorkerMetric } from '../runtime/workerFactory';
import { auditSecurityEvents, getSecurityAuditEvents } from '../security/auditSecurityEvents';
import { detectSuspiciousActivity } from '../security/detectSuspiciousActivity';
import { requestFingerprint } from '../security/requestFingerprint';
import { queueHealth } from './queueHealth';
import { runtimeMetrics } from './runtimeMetrics';
import { systemHealth } from './systemHealth';

export async function buildOperationalSnapshot(): Promise<OperationalSnapshot> {
  const manager = await buildRuntimeManagerSnapshot();
  const runtimeConfig = getRuntimeConfig();

  const queueHealthSummary = queueHealth(manager.queueStates);
  const metrics = runtimeMetrics(manager.queueStates, manager.workerStates);

  const queueMetrics = await Promise.all([
    getQueueMetrics('analysis').then((m) => ({ queue: 'analysis', ...m })),
    getQueueMetrics('market').then((m) => ({ queue: 'market', ...m })),
    getQueueMetrics('geo').then((m) => ({ queue: 'geo', ...m })),
    getQueueMetrics('alert').then((m) => ({ queue: 'alert', ...m })),
    getQueueMetrics('ingestion').then((m) => ({ queue: 'ingestion', ...m })),
  ]);

  const workerMetrics = [
    { worker: 'analysis', ...getWorkerMetric('analysis') },
    { worker: 'market', ...getWorkerMetric('market') },
    { worker: 'geo', ...getWorkerMetric('geo') },
    { worker: 'alert', ...getWorkerMetric('alert') },
    { worker: 'ingestion', ...getWorkerMetric('ingestion') },
  ];

  const securitySignals = detectSuspiciousActivity({
    rapidRequestCount: Number(process.env.RUNTIME_RAPID_REQUEST_COUNT || 0),
    distinctRoutes: Number(process.env.RUNTIME_DISTINCT_ROUTE_COUNT || 0),
    authFailures: Number(process.env.RUNTIME_AUTH_FAILURE_COUNT || 0),
    fingerprint: requestFingerprint({
      ip: process.env.RUNTIME_SAMPLE_IP || '127.0.0.1',
      method: 'GET',
      path: '/admin/runtime',
      userAgent: process.env.RUNTIME_SAMPLE_UA || 'runtime-monitor',
      userId: process.env.RUNTIME_SAMPLE_USER || 'system',
    }),
  });

  auditSecurityEvents('runtime_snapshot', securitySignals);

  const health = systemHealth({
    runtimeState: manager.runtimeStatus.state,
    queueFailed: queueHealthSummary.failed,
    workerFailed: manager.workerStates.filter((worker) => worker.state === 'FAILED').length,
    securitySignals,
  });

  const runtimeWarnings: string[] = [];
  if (manager.redisHealth.state === 'DEGRADED') {
    runtimeWarnings.push(manager.redisHealth.message);
  }
  if (queueHealthSummary.failed > 0) {
    runtimeWarnings.push(`Failed queues detected: ${queueHealthSummary.failed}`);
  }
  if (manager.workerStates.some((worker) => worker.state === 'DEGRADED')) {
    runtimeWarnings.push('One or more workers are degraded.');
  }
  if (queueMetrics.some((metric) => metric.backend === 'LOCAL_FALLBACK')) {
    runtimeWarnings.push('LOCAL_FALLBACK mode is active for at least one queue.');
  }

  return {
    runtimeStatus: manager.runtimeStatus,
    queueStates: manager.queueStates,
    workerStates: manager.workerStates,
    runtimeMetrics: metrics,
    redisStatus: manager.redisHealth.state,
    redisLatency: manager.redisHealth.redisLatency,
    queueMetrics,
    workerMetrics,
    throughput: {
      analysisPerHour: metrics.analysisThroughputPerHour,
      refreshPerHour: metrics.refreshThroughputPerHour,
    },
    runtimeWarnings,
    fallbackMode: queueMetrics.some((metric) => metric.backend === 'LOCAL_FALLBACK') ? 'LOCAL_FALLBACK' : 'NONE',
    distributedRuntimeEnabled: runtimeConfig.distributedRuntimeEnabled,
    operationalSnapshot: {
      generatedAt: new Date().toISOString(),
      degradedQueues: queueHealthSummary.degraded + queueHealthSummary.failed,
      degradedWorkers: manager.workerStates.filter((worker) => ['DEGRADED', 'FAILED'].includes(worker.state)).length,
      mode: manager.runtimeStatus.mode,
    },
    securitySignals: [
      ...securitySignals,
      ...getSecurityAuditEvents()
        .slice(0, 5)
        .map((record) => record.signal),
    ],
    healthSummary: {
      live: health.overall === 'FAILED' ? 'FAILED' : 'RUNNING',
      ready: ['RUNNING', 'READY'].includes(String(manager.runtimeStatus.state))
        ? 'READY'
        : manager.runtimeStatus.state,
      overall: health.overall,
      detail: health.detail,
    },
  };
}
