import { buildInsightBase } from '../autonomy/autonomyInsightTypes';

export function strategicDivergenceDetector(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  expectedTrajectory: number;
  observedTrajectory: number;
}) {
  const base = buildInsightBase(input);
  const divergence = Math.abs((input.expectedTrajectory || 0) - (input.observedTrajectory || 0));
  return { ...base, divergence, divergenceState: divergence >= 30 ? 'high' : divergence >= 15 ? 'moderate' : 'low' };
}
