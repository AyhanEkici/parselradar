import { buildInsightBase } from '../autonomy/autonomyInsightTypes';

export function opportunityPriorityMatrix(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  opportunityScore: number;
  riskScore: number;
}) {
  const base = buildInsightBase(input);
  const normalizedOpportunity = Math.max(0, Math.min(100, input.opportunityScore));
  const normalizedRisk = Math.max(0, Math.min(100, input.riskScore));
  const priorityScore = Math.max(0, Math.min(100, normalizedOpportunity * 0.75 + (100 - normalizedRisk) * 0.25));
  return {
    ...base,
    priorityScore,
    matrixBand:
      priorityScore >= 85 ? 'A1' :
      priorityScore >= 70 ? 'A2' :
      priorityScore >= 55 ? 'B1' :
      priorityScore >= 40 ? 'B2' : 'C',
  };
}
