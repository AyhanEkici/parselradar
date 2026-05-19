import { buildExecutionInsightBase } from '../execution/executionInsightTypes';

export function strategicDecisionEngine(input: {
  source: string; timestamp: string; freshness: number; confidence: number; governanceState: string; evidenceLineage: unknown[];
  directionScore: number; pressureScore: number;
}) {
  const decisionScore = Math.max(0, Math.min(100, input.directionScore * 0.6 + (100 - input.pressureScore) * 0.4));
  return {
    ...buildExecutionInsightBase({ ...input }),
    decisionScore,
    humanGovernedExecutionOnly: true,
  };
}
