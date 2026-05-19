import { buildExecutionInsightBase } from '../execution/executionInsightTypes';

export function infrastructureImpactSimulator(input: { source: string; timestamp: string; freshness: number; confidence: number; governanceState: string; evidenceLineage: unknown[]; infrastructureScore: number; }) {
  const impactScore = Math.max(0, Math.min(100, input.infrastructureScore));
  return { ...buildExecutionInsightBase({ ...input }), impactScore, simulationType: 'infrastructure_impact' };
}
