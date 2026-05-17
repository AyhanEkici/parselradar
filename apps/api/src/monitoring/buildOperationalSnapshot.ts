import { auditSecurityEvents, getSecurityAuditEvents } from '../security/auditSecurityEvents';
import { detectSuspiciousActivity } from '../security/detectSuspiciousActivity';
import { requestFingerprint } from '../security/requestFingerprint';
import { buildRuntimeManagerSnapshot } from '../runtime/runtimeManager';
import { OperationalSnapshot } from '../runtime/runtimeState';
import { queueHealth } from './queueHealth';
import { runtimeMetrics } from './runtimeMetrics';
import { systemHealth } from './systemHealth';

export function buildOperationalSnapshot(): OperationalSnapshot {
  const manager = buildRuntimeManagerSnapshot();
  const queueHealthSummary = queueHealth(manager.queueStates);
  const metrics = runtimeMetrics(manager.queueStates, manager.workerStates);

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
    workerFailed: manager.workerStates.filter((w) => w.state === 'FAILED').length,
    securitySignals,
  });

  return {
    runtimeStatus: manager.runtimeStatus,
    queueStates: manager.queueStates,
    workerStates: manager.workerStates,
    runtimeMetrics: metrics,
    operationalSnapshot: {
      generatedAt: new Date().toISOString(),
      degradedQueues: queueHealthSummary.degraded + queueHealthSummary.failed,
      degradedWorkers: manager.workerStates.filter((w) => ['DEGRADED', 'FAILED'].includes(w.state)).length,
      mode: manager.runtimeStatus.mode,
    },
    securitySignals: [...securitySignals, ...getSecurityAuditEvents().slice(0, 5).map((record) => record.signal)],
    healthSummary: {
      live: health.overall === 'FAILED' ? 'FAILED' : 'RUNNING',
      ready: ['RUNNING', 'READY'].includes(String(manager.runtimeStatus.state)) ? 'READY' : manager.runtimeStatus.state,
      overall: health.overall,
      detail: health.detail,
    },
  };
}
