import { buildExecutionInsightBase } from '../execution/executionInsightTypes';

export function strategicExposureEngine(input: { source: string; timestamp: string; freshness: number; confidence: number; governanceState: string; evidenceLineage: unknown[]; concentration: number; volatility: number; }) {
  const exposureScore = Math.max(0, Math.min(100, input.concentration * 0.6 + input.volatility * 0.4));
  return { ...buildExecutionInsightBase({ ...input }), exposureScore };
}
