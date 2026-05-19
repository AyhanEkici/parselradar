import { intelligenceFeedGenerator } from './intelligenceFeedGenerator';

export function regionalActivityFeed(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  activityScore: number;
}) {
  return intelligenceFeedGenerator({
    source: input.source,
    timestamp: input.timestamp,
    freshness: input.freshness,
    confidence: input.confidence,
    governanceState: input.governanceState,
    evidenceLineage: input.evidenceLineage,
    events: [{ type: 'regional_activity', score: input.activityScore }],
  });
}
