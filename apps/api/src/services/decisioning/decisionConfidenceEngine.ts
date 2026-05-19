import { DecisionConfidence, buildExecutionInsightBase } from '../execution/executionInsightTypes';

export function decisionConfidenceEngine(input: { source: string; timestamp: string; freshness: number; confidence: number; governanceState: string; evidenceLineage: unknown[]; supportScore: number; conflictScore: number; }) {
  const score = Math.max(0, Math.min(100, input.supportScore * 0.7 + (100 - input.conflictScore) * 0.3));
  const decisionConfidence: DecisionConfidence = score >= 85 ? 'VERY_HIGH' : score >= 65 ? 'HIGH' : score >= 40 ? 'MODERATE' : 'LOW';
  return { ...buildExecutionInsightBase({ ...input }), decisionConfidence, decisionConfidenceScore: score };
}
