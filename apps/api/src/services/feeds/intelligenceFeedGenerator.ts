import { FeedSeverity, buildInsightBase } from '../autonomy/autonomyInsightTypes';

export function intelligenceFeedGenerator(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  events: Array<{ type: string; score: number }>;
}) {
  const base = buildInsightBase(input);
  const maxScore = Math.max(0, ...((input.events || []).map((x) => x.score)));
  const severity: FeedSeverity = maxScore >= 85 ? 'CRITICAL' : maxScore >= 70 ? 'HIGH_PRIORITY' : maxScore >= 50 ? 'IMPORTANT' : maxScore >= 25 ? 'NOTICE' : 'INFO';
  return { ...base, severity, events: input.events || [] };
}
