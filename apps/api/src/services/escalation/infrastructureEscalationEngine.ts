import { buildInsightBase } from '../autonomy/autonomyInsightTypes';

export function infrastructureEscalationEngine(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  momentumScore: number;
}) {
  const base = buildInsightBase(input);
  const escalation = input.momentumScore >= 85 ? 'CRITICAL' : input.momentumScore >= 65 ? 'HIGH_PRIORITY' : input.momentumScore >= 45 ? 'IMPORTANT' : 'NOTICE';
  return { ...base, escalation };
}
