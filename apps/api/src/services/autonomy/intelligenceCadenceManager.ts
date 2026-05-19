import { buildInsightBase } from './autonomyInsightTypes';

export function intelligenceCadenceManager(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  monitoringState: string;
}) {
  const base = buildInsightBase(input);
  const cadenceMinutes =
    input.monitoringState === 'HIGH_ACTIVITY'
      ? 15
      : input.monitoringState === 'ACTIVE_MONITORING'
        ? 30
        : input.monitoringState === 'WATCH'
          ? 90
          : 240;
  return { ...base, cadenceMinutes };
}
