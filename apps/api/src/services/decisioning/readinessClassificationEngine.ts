import { buildExecutionInsightBase } from '../execution/executionInsightTypes';

export function readinessClassificationEngine(input: { source: string; timestamp: string; freshness: number; confidence: number; governanceState: string; evidenceLineage: unknown[]; readinessScore: number; }) {
  const score = Math.max(0, Math.min(100, input.readinessScore));
  const classification = score >= 85 ? 'STRATEGIC_READY' : score >= 70 ? 'READY' : score >= 50 ? 'PREPARING' : score >= 30 ? 'LIMITED' : 'NOT_READY';
  return { ...buildExecutionInsightBase({ ...input, executionReadiness: classification as any }), readinessScore: score, readinessClassification: classification };
}
