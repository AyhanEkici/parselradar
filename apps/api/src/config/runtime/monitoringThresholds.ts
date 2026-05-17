export const MONITORING_THRESHOLDS = {
  staleAnalysisMinutes: 180,
  staleRefreshMinutes: 120,
  throughputFloorPerHour: 3,
  securitySignalWarning: 2,
  securitySignalCritical: 5,
} as const;
