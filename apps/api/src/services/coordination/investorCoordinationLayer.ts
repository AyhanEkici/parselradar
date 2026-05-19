import { buildExecutionInsightBase } from '../execution/executionInsightTypes';

export function investorCoordinationLayer(input: { source: string; timestamp: string; freshness: number; confidence: number; governanceState: string; evidenceLineage: unknown[]; investorQueueDepth: number; handoffCount: number; }) {
  const investorCoordinationScore = Math.max(0, Math.min(100, input.handoffCount * 12 + (100 - input.investorQueueDepth * 8)));
  return { ...buildExecutionInsightBase({ ...input }), investorCoordinationScore, investorQueueDepth: input.investorQueueDepth };
}
