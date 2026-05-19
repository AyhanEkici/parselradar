import { buildInsightBase } from '../autonomy/autonomyInsightTypes';

export function municipalityPressureMonitor(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  permitBacklog: number;
  policyVolatility: number;
}) {
  const base = buildInsightBase(input);
  const pressure = Math.max(0, Math.min(100, input.permitBacklog * 0.6 + input.policyVolatility * 0.4));
  return {
    ...base,
    pressureScore: pressure,
    pressureState: pressure >= 80 ? 'critical' : pressure >= 60 ? 'elevated' : pressure >= 40 ? 'managed' : 'low',
  };
}
