import { ExecutionReadiness, buildExecutionInsightBase } from './executionInsightTypes';

export function executionReadinessScorer(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  constraintScore: number;
  dependencyScore: number;
  riskScore: number;
}) {
  const score = Math.max(0, Math.min(100, input.constraintScore * 0.4 + input.dependencyScore * 0.3 + (100 - input.riskScore) * 0.3));
  const executionReadiness: ExecutionReadiness =
    score >= 85 ? 'STRATEGIC_READY' :
    score >= 70 ? 'READY' :
    score >= 50 ? 'PREPARING' :
    score >= 30 ? 'LIMITED' : 'NOT_READY';

  return {
    ...buildExecutionInsightBase({ ...input, executionReadiness }),
    readinessScore: score,
  };
}
