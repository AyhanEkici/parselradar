export function connectorDriftDetector(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  baselineStatus: string;
  currentStatus: string;
}) {
  const driftDetected = input.baselineStatus !== input.currentStatus;

  return {
    source: input.source,
    timestamp: input.timestamp,
    freshness: input.freshness,
    confidence: input.confidence,
    governanceState: input.governanceState,
    evidenceLineage: input.evidenceLineage || [],
    baselineStatus: input.baselineStatus,
    currentStatus: input.currentStatus,
    driftDetected,
    deterministic: true,
  };
}
