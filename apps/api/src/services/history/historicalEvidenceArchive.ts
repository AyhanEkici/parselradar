export function historicalEvidenceArchive(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  evidenceLineage: unknown[];
  governanceState: string;
  records: Array<{ at: string; source: string; label: string; value?: unknown }>;
}) {
  const records = (input.records || []).slice().sort((a, b) => a.at.localeCompare(b.at));
  return {
    source: input.source,
    timestamp: input.timestamp,
    freshness: input.freshness,
    confidence: input.confidence,
    evidenceLineage: input.evidenceLineage || [],
    governanceState: input.governanceState,
    records,
    retainedCount: records.length,
    deterministic: true,
    noFabricatedHistory: true,
  };
}
