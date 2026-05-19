import { buildExecutionInsightBase } from '../execution/executionInsightTypes';

export function regionalDependencyAnalyzer(input: { source: string; timestamp: string; freshness: number; confidence: number; governanceState: string; evidenceLineage: unknown[]; dependencies: Array<{ key: string; status: string }>; }) {
  const dependencies = input.dependencies || [];
  const blocked = dependencies.filter((d) => d.status !== 'HEALTHY').length;
  return { ...buildExecutionInsightBase({ ...input }), dependencies, blockedDependencies: blocked };
}
