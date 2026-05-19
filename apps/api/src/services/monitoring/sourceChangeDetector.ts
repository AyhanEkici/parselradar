export function sourceChangeDetector(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  previousHash?: string;
  currentHash: string;
}) {
  const changed = (input.previousHash || '') !== input.currentHash;

  return {
    source: input.source,
    timestamp: input.timestamp,
    freshness: input.freshness,
    confidence: input.confidence,
    governanceState: input.governanceState,
    evidenceLineage: input.evidenceLineage || [],
    changed,
    previousHash: input.previousHash || null,
    currentHash: input.currentHash,
    deterministic: true,
  };
}
