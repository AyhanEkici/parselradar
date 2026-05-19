import { intelligenceFeedGenerator } from './intelligenceFeedGenerator';

export function infrastructureExpansionFeed(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  expansionScore: number;
}) {
  return intelligenceFeedGenerator({
    source: input.source,
    timestamp: input.timestamp,
    freshness: input.freshness,
    confidence: input.confidence,
    governanceState: input.governanceState,
    evidenceLineage: input.evidenceLineage,
    events: [{ type: 'infrastructure_expansion', score: input.expansionScore }],
  });
}
