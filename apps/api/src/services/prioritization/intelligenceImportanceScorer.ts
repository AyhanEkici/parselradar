import { buildInsightBase } from '../autonomy/autonomyInsightTypes';

export function intelligenceImportanceScorer(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  impactScore: number;
  urgencyScore: number;
}) {
  const base = buildInsightBase(input);
  const score = Math.max(0, Math.min(100, input.impactScore * 0.65 + input.urgencyScore * 0.35));
  return {
    ...base,
    importanceScore: score,
    importanceTier: score >= 85 ? 'CRITICAL' : score >= 65 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW',
  };
}
