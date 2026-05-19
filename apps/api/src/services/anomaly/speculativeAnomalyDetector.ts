export type AnomalyLevel = 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export function speculativeAnomalyDetector(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  evidenceLineage: unknown[];
  governanceState: string;
  speculativeHeat: number;
  unsupportedAssumptions: number;
}) {
  const score = Math.max(0, Math.min(100, input.speculativeHeat + input.unsupportedAssumptions * 8));
  const level: AnomalyLevel = score >= 85 ? 'CRITICAL' : score >= 70 ? 'HIGH' : score >= 45 ? 'MODERATE' : score >= 20 ? 'LOW' : 'NONE';

  return {
    source: input.source,
    timestamp: input.timestamp,
    freshness: input.freshness,
    confidence: input.confidence,
    evidenceLineage: input.evidenceLineage || [],
    governanceState: input.governanceState,
    level,
    anomalyScore: score,
    deterministic: true,
  };
}
