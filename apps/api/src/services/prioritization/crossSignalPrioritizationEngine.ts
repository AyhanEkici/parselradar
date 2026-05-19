import { buildInsightBase } from '../autonomy/autonomyInsightTypes';

export function crossSignalPrioritizationEngine(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  watchlistScore: number;
  feedScore: number;
  portfolioScore: number;
}) {
  const base = buildInsightBase(input);
  const score = Math.max(0, Math.min(100, input.watchlistScore * 0.4 + input.feedScore * 0.35 + input.portfolioScore * 0.25));
  return { ...base, crossSignalPriorityScore: score };
}
