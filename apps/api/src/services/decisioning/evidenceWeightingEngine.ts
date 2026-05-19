import { buildExecutionInsightBase } from '../execution/executionInsightTypes';

export function evidenceWeightingEngine(input: { source: string; timestamp: string; freshness: number; confidence: number; governanceState: string; evidenceLineage: unknown[]; sourceCount: number; verifiedCount: number; }) {
  const evidenceWeight = input.sourceCount > 0 ? Math.max(0, Math.min(100, Math.round((input.verifiedCount / input.sourceCount) * 100))) : 0;
  return { ...buildExecutionInsightBase({ ...input }), evidenceWeight, recommendationLineageVisible: true };
}
