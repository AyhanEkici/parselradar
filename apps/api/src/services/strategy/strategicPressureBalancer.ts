import { buildExecutionInsightBase } from '../execution/executionInsightTypes';

export function strategicPressureBalancer(input: {
  source: string; timestamp: string; freshness: number; confidence: number; governanceState: string; evidenceLineage: unknown[];
  municipalPressure: number; infrastructurePressure: number; investorPressure: number;
}) {
  const pressureScore = Math.max(0, Math.min(100, input.municipalPressure * 0.4 + input.infrastructurePressure * 0.35 + input.investorPressure * 0.25));
  return {
    ...buildExecutionInsightBase({ ...input }),
    pressureScore,
    pressureState: pressureScore >= 75 ? 'HIGH' : pressureScore >= 45 ? 'MEDIUM' : 'LOW',
  };
}
