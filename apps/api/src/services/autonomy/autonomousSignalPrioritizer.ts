import { InvestorPriority, buildInsightBase } from './autonomyInsightTypes';

export function autonomousSignalPrioritizer(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  anomalyScore: number;
  opportunityScore: number;
}) {
  const base = buildInsightBase(input);
  const score = Math.max(0, Math.min(100, input.anomalyScore * 0.55 + input.opportunityScore * 0.45));
  const priority: InvestorPriority = score >= 85 ? 'CRITICAL' : score >= 65 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW';
  return { ...base, priority, priorityScore: score };
}
