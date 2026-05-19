import { buildInsightBase } from '../autonomy/autonomyInsightTypes';

export function municipalDecisionMomentum(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  approvals: number;
  pending: number;
}) {
  const base = buildInsightBase(input);
  const denominator = input.approvals + input.pending;
  const momentum = denominator > 0 ? Math.round((input.approvals / denominator) * 100) : 0;
  return { ...base, momentum };
}
