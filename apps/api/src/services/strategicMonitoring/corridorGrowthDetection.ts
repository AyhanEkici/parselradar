import { buildInsightBase } from '../autonomy/autonomyInsightTypes';

export function corridorGrowthDetection(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  permitGrowthPct: number;
  infrastructureGrowthPct: number;
}) {
  const base = buildInsightBase(input);
  const growthScore = Math.max(0, Math.min(100, input.permitGrowthPct * 0.5 + input.infrastructureGrowthPct * 0.5));
  return { ...base, growthScore, growthState: growthScore >= 70 ? 'strong' : growthScore >= 45 ? 'emerging' : 'muted' };
}
