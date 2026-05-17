export const RUNTIME_THRESHOLDS = {
  degradedQueueRatio: 0.35,
  degradedWorkerRatio: 0.35,
  queueDepthWarning: 120,
  queueDepthCritical: 300,
  maxFailureRatePercent: 8,
} as const;
