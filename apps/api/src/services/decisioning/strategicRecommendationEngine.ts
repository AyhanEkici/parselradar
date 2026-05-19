import { buildExecutionInsightBase } from '../execution/executionInsightTypes';

export function strategicRecommendationEngine(input: { source: string; timestamp: string; freshness: number; confidence: number; governanceState: string; evidenceLineage: unknown[]; decisionConfidenceScore: number; executionRiskScore: number; }) {
  const score = Math.max(0, Math.min(100, input.decisionConfidenceScore * 0.6 + (100 - input.executionRiskScore) * 0.4));
  const recommendation = score >= 80 ? 'GO_TO_REVIEW' : score >= 60 ? 'PREPARE_EXECUTION' : score >= 40 ? 'MONITOR_AND_POSITION' : 'OBSERVE_ONLY';
  return { ...buildExecutionInsightBase({ ...input }), recommendation, governedRecommendationRouting: true, noSpeculativeFactClaims: true };
}
