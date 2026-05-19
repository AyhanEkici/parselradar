import { buildInsightBase } from '../autonomy/autonomyInsightTypes';

export function strategicUrgencyClassifier(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  momentum: number;
  divergence: number;
}) {
  const base = buildInsightBase(input);
  const score = Math.max(0, Math.min(100, input.momentum * 0.7 + input.divergence * 0.3));
  return {
    ...base,
    urgencyScore: score,
    urgency: score >= 85 ? 'immediate' : score >= 65 ? 'soon' : score >= 40 ? 'watch' : 'background',
  };
}
