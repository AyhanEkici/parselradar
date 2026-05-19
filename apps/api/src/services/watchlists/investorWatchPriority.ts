import { InvestorPriority, buildInsightBase } from '../autonomy/autonomyInsightTypes';

export function investorWatchPriority(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  riskScore: number;
  opportunityScore: number;
}) {
  const base = buildInsightBase(input);
  const score = Math.max(0, Math.min(100, input.riskScore * 0.6 + input.opportunityScore * 0.4));
  const priority: InvestorPriority = score >= 85 ? 'CRITICAL' : score >= 65 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW';
  return { ...base, priority, score };
}
