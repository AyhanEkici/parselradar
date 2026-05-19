export type MonitoringState = 'STABLE' | 'WATCH' | 'ACTIVE_MONITORING' | 'HIGH_ACTIVITY';

export function territorialMonitoringEngine(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  evidenceLineage: unknown[];
  governanceState: string;
  activityScore: number;
}) {
  const boundedActivity = Math.max(0, Math.min(100, Number(input.activityScore || 0)));
  const state: MonitoringState =
    boundedActivity >= 80 ? 'HIGH_ACTIVITY' : boundedActivity >= 60 ? 'ACTIVE_MONITORING' : boundedActivity >= 35 ? 'WATCH' : 'STABLE';

  return {
    source: input.source,
    timestamp: input.timestamp,
    freshness: Math.max(0, Math.min(100, Number(input.freshness || 0))),
    confidence: Math.max(0, Math.min(100, Number(input.confidence || 0))),
    evidenceLineage: input.evidenceLineage || [],
    governanceState: input.governanceState,
    state,
    activityScore: boundedActivity,
    deterministic: true,
  };
}
