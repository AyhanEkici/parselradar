import { intelligenceFeedGenerator } from './intelligenceFeedGenerator';

export function speculativeRiskFeed(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  speculativeScore: number;
}) {
  return intelligenceFeedGenerator({
    source: input.source,
    timestamp: input.timestamp,
    freshness: input.freshness,
    confidence: input.confidence,
    governanceState: input.governanceState,
    evidenceLineage: input.evidenceLineage,
    events: [{ type: 'speculative_risk', score: input.speculativeScore }],
  });
}
