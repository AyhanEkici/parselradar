import { buildExecutionInsightBase } from '../execution/executionInsightTypes';

export function intelligenceExecutionBridge(input: { source: string; timestamp: string; freshness: number; confidence: number; governanceState: string; evidenceLineage: unknown[]; recommendation: string; readiness: string; }) {
  return {
    ...buildExecutionInsightBase({ ...input, executionReadiness: input.readiness as any }),
    recommendation: input.recommendation,
    bridgeState: 'GOVERNED_HANDOFF',
    humanGovernedExecutionOnly: true,
  };
}
