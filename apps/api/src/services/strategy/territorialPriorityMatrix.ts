import { buildExecutionInsightBase } from '../execution/executionInsightTypes';

export function territorialPriorityMatrix(input: {
  source: string; timestamp: string; freshness: number; confidence: number; governanceState: string; evidenceLineage: unknown[];
  readinessScore: number; opportunityScore: number; riskScore: number;
}) {
  const priorityScore = Math.max(0, Math.min(100, input.readinessScore * 0.35 + input.opportunityScore * 0.45 + (100 - input.riskScore) * 0.2));
  return {
    ...buildExecutionInsightBase({ ...input }),
    priorityScore,
    matrixBand: priorityScore >= 80 ? 'P1' : priorityScore >= 60 ? 'P2' : priorityScore >= 40 ? 'P3' : 'P4',
  };
}
