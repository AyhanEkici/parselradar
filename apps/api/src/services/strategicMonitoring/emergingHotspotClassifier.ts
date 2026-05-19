import { buildInsightBase } from '../autonomy/autonomyInsightTypes';

export function emergingHotspotClassifier(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  hotspotScore: number;
}) {
  const base = buildInsightBase(input);
  const score = Math.max(0, Math.min(100, input.hotspotScore));
  return { ...base, hotspotScore: score, hotspotTier: score >= 80 ? 'tier_1' : score >= 60 ? 'tier_2' : score >= 40 ? 'tier_3' : 'tier_4' };
}
