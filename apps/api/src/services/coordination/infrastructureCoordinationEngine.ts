import { buildExecutionInsightBase } from '../execution/executionInsightTypes';

export function infrastructureCoordinationEngine(input: { source: string; timestamp: string; freshness: number; confidence: number; governanceState: string; evidenceLineage: unknown[]; infrastructureDependencies: number; bottlenecks: number; }) {
  const infrastructureCoordinationScore = Math.max(0, Math.min(100, input.infrastructureDependencies * 14 + (100 - input.bottlenecks * 12)));
  return { ...buildExecutionInsightBase({ ...input }), infrastructureCoordinationScore, infrastructureDependencies: input.infrastructureDependencies, bottlenecks: input.bottlenecks };
}
