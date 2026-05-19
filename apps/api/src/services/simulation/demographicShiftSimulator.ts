import { buildExecutionInsightBase } from '../execution/executionInsightTypes';

export function demographicShiftSimulator(input: { source: string; timestamp: string; freshness: number; confidence: number; governanceState: string; evidenceLineage: unknown[]; demographicPressure: number; }) {
  const shiftScore = Math.max(0, Math.min(100, input.demographicPressure));
  return { ...buildExecutionInsightBase({ ...input }), shiftScore, simulationType: 'demographic_shift' };
}
