import { buildExecutionInsightBase } from '../execution/executionInsightTypes';

export function operationalReadinessEngine(input: { source: string; timestamp: string; freshness: number; confidence: number; governanceState: string; evidenceLineage: unknown[]; readinessScore: number; }) {
  const score = Math.max(0, Math.min(100, input.readinessScore));
  const executionReadiness = score >= 85 ? 'STRATEGIC_READY' : score >= 70 ? 'READY' : score >= 50 ? 'PREPARING' : score >= 30 ? 'LIMITED' : 'NOT_READY';
  return { ...buildExecutionInsightBase({ ...input, executionReadiness: executionReadiness as any }), readinessScore: score };
}
