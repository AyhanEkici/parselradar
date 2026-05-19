import { buildExecutionInsightBase } from '../execution/executionInsightTypes';

export function territorialRiskMatrix(input: { source: string; timestamp: string; freshness: number; confidence: number; governanceState: string; evidenceLineage: unknown[]; exposureRisk: number; dependencyRisk: number; executionRisk: number; }) {
  const matrixScore = Math.max(0, Math.min(100, input.exposureRisk * 0.35 + input.dependencyRisk * 0.35 + input.executionRisk * 0.3));
  return { ...buildExecutionInsightBase({ ...input }), matrixScore };
}
