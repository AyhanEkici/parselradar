import { buildInsightBase } from '../autonomy/autonomyInsightTypes';

type ReviewItem = { id: string; reason: string; priority: string };

export function autonomyReviewQueue(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  items: ReviewItem[];
}) {
  const base = buildInsightBase(input);
  return { ...base, queueDepth: (input.items || []).length, items: input.items || [] };
}
