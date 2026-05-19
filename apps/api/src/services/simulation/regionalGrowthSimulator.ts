import { buildExecutionInsightBase } from '../execution/executionInsightTypes';

export function regionalGrowthSimulator(input: { source: string; timestamp: string; freshness: number; confidence: number; governanceState: string; evidenceLineage: unknown[]; growthSignal: number; }) {
  const growthScore = Math.max(0, Math.min(100, input.growthSignal));
  return { ...buildExecutionInsightBase({ ...input }), growthScore, simulationType: 'regional_growth' };
}
