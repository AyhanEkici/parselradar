import { buildInsightBase } from '../autonomy/autonomyInsightTypes';

type ReviewItem = { id: string; reason: string; priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' };

export function autonomousReviewQueue(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  items: ReviewItem[];
  hiddenEscalationDetected?: boolean;
}) {
  const base = buildInsightBase(input);
  return {
    ...base,
    queueDepth: (input.items || []).length,
    items: input.items || [],
    reviewable: true,
    hiddenEscalationDetected: Boolean(input.hiddenEscalationDetected),
  };
}
