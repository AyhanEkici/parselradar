import { buildInsightBase } from '../autonomy/autonomyInsightTypes';

export function priorityDriftMonitor(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  expectedScore: number;
  observedScore: number;
}) {
  const base = buildInsightBase(input);
  const drift = Math.abs((input.expectedScore || 0) - (input.observedScore || 0));
  return { ...base, drift, driftState: drift >= 25 ? 'HIGH' : drift >= 12 ? 'MEDIUM' : 'LOW' };
}
