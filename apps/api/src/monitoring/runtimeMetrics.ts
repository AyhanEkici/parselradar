import { RUNTIME_THRESHOLDS } from '../config/runtime/runtimeThresholds';
import { QueueState, RuntimeMetrics, WorkerState } from '../runtime/runtimeState';

export function runtimeMetrics(queueStates: QueueState[], workerStates: WorkerState[]): RuntimeMetrics {
  const queueDepthTotal = queueStates.reduce((sum, q) => sum + q.depth, 0);
  const failureTotal = queueStates.reduce((sum, q) => sum + q.failures, 0);
  const retryTotal = queueStates.reduce((sum, q) => sum + q.retries, 0);
  const failureRatePercent = retryTotal + failureTotal === 0 ? 0 : Number(((failureTotal / (retryTotal + failureTotal)) * 100).toFixed(2));

  const runningWorkers = workerStates.filter((w) => w.state === 'RUNNING').length;
  const analysisThroughputPerHour = Math.max(0, runningWorkers * 6 - Math.floor(queueDepthTotal / 20));
  const refreshThroughputPerHour = Math.max(0, runningWorkers * 5 - Math.floor(queueDepthTotal / 24));

  return {
    queueDepthTotal,
    failureRatePercent,
    analysisThroughputPerHour,
    refreshThroughputPerHour,
    staleAnalysisCount: Math.max(0, queueDepthTotal - RUNTIME_THRESHOLDS.queueDepthWarning),
    staleRefreshCount: Math.max(0, Math.floor(queueDepthTotal / 2) - RUNTIME_THRESHOLDS.queueDepthWarning),
  };
}
