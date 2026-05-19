export function parcelEvolutionTimeline(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  evidenceLineage: unknown[];
  governanceState: string;
  events: Array<{ at: string; label: string; source: string }>;
}) {
  const sortedEvents = (input.events || []).slice().sort((a, b) => a.at.localeCompare(b.at));

  return {
    source: input.source,
    timestamp: input.timestamp,
    freshness: input.freshness,
    confidence: input.confidence,
    evidenceLineage: input.evidenceLineage || [],
    governanceState: input.governanceState,
    direction: sortedEvents.length >= 4 ? 'TRANSFORMING' : sortedEvents.length >= 3 ? 'ACCELERATING' : sortedEvents.length >= 2 ? 'DEVELOPING' : sortedEvents.length === 1 ? 'STATIC' : 'DECLINING',
    events: sortedEvents,
    deterministic: true,
    noFabricatedHistory: true,
  };
}
