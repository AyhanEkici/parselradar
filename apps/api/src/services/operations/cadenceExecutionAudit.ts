import { buildInsightBase } from '../autonomy/autonomyInsightTypes';

export function cadenceExecutionAudit(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  expectedRuns: number;
  completedRuns: number;
}) {
  const base = buildInsightBase(input);
  const adherence = input.expectedRuns > 0 ? Math.round((input.completedRuns / input.expectedRuns) * 100) : 100;
  return { ...base, expectedRuns: input.expectedRuns, completedRuns: input.completedRuns, adherence: Math.max(0, Math.min(100, adherence)) };
}
