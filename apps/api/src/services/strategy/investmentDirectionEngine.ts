import { StrategicDirection, buildExecutionInsightBase } from '../execution/executionInsightTypes';

export function investmentDirectionEngine(input: {
  source: string; timestamp: string; freshness: number; confidence: number; governanceState: string; evidenceLineage: unknown[];
  directionScore: number;
}) {
  const s = Math.max(0, Math.min(100, input.directionScore));
  const strategicDirection: StrategicDirection = s >= 85 ? 'STRATEGIC_EXPANSION' : s >= 65 ? 'ACCUMULATING' : s >= 40 ? 'POSITIONING' : 'OBSERVE';
  return {
    ...buildExecutionInsightBase({ ...input }),
    strategicDirection,
    noInvestmentGuarantee: true,
  };
}
