import { ExecutionRisk, buildExecutionInsightBase } from '../execution/executionInsightTypes';

export function executionRiskClassifier(input: { source: string; timestamp: string; freshness: number; confidence: number; governanceState: string; evidenceLineage: unknown[]; riskScore: number; }) {
  const s = Math.max(0, Math.min(100, input.riskScore));
  const executionRisk: ExecutionRisk = s >= 80 ? 'CRITICAL' : s >= 60 ? 'ELEVATED' : s >= 35 ? 'MANAGEABLE' : 'MINIMAL';
  return { ...buildExecutionInsightBase({ ...input }), executionRisk, executionRiskScore: s };
}
