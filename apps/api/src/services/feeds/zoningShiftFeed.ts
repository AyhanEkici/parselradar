import { intelligenceFeedGenerator } from './intelligenceFeedGenerator';

export function zoningShiftFeed(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  zoningShiftScore: number;
}) {
  return intelligenceFeedGenerator({
    source: input.source,
    timestamp: input.timestamp,
    freshness: input.freshness,
    confidence: input.confidence,
    governanceState: input.governanceState,
    evidenceLineage: input.evidenceLineage,
    events: [{ type: 'zoning_shift', score: input.zoningShiftScore }],
  });
}
