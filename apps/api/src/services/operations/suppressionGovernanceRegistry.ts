import { buildInsightBase } from '../autonomy/autonomyInsightTypes';

export function suppressionGovernanceRegistry(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  activeRules: Array<{ id: string; reason: string; expiresAt: string }>;
}) {
  const base = buildInsightBase(input);
  return { ...base, activeRules: input.activeRules || [], activeCount: (input.activeRules || []).length };
}
