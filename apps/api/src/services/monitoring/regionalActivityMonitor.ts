import { territorialMonitoringEngine } from './territorialMonitoringEngine';

export function regionalActivityMonitor(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  evidenceLineage: unknown[];
  governanceState: string;
  changeCount: number;
  alertCount: number;
}) {
  const activityScore = Math.max(0, Math.min(100, input.changeCount * 12 + input.alertCount * 18));
  const monitoring = territorialMonitoringEngine({
    source: input.source,
    timestamp: input.timestamp,
    freshness: input.freshness,
    confidence: input.confidence,
    evidenceLineage: input.evidenceLineage,
    governanceState: input.governanceState,
    activityScore,
  });

  return {
    ...monitoring,
    changeCount: input.changeCount,
    alertCount: input.alertCount,
  };
}
