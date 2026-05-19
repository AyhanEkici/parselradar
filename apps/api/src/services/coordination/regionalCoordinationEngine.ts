import { buildExecutionInsightBase } from '../execution/executionInsightTypes';

export function regionalCoordinationEngine(input: { source: string; timestamp: string; freshness: number; confidence: number; governanceState: string; evidenceLineage: unknown[]; activeRegions: number; dependentRegions: number; }) {
  const coordinationScore = Math.max(0, Math.min(100, input.activeRegions * 18 + input.dependentRegions * 10));
  return { ...buildExecutionInsightBase({ ...input }), coordinationScore, activeRegions: input.activeRegions, dependentRegions: input.dependentRegions };
}
