import { AnomalyLevel } from './speculativeAnomalyDetector';

export function abnormalPricingMovement(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  evidenceLineage: unknown[];
  governanceState: string;
  deltaRatio: number;
}) {
  const abs = Math.abs(input.deltaRatio || 0);
  const level: AnomalyLevel = abs >= 0.45 ? 'CRITICAL' : abs >= 0.3 ? 'HIGH' : abs >= 0.18 ? 'MODERATE' : abs >= 0.08 ? 'LOW' : 'NONE';

  return {
    source: input.source,
    timestamp: input.timestamp,
    freshness: input.freshness,
    confidence: input.confidence,
    evidenceLineage: input.evidenceLineage || [],
    governanceState: input.governanceState,
    level,
    deltaRatio: input.deltaRatio,
    deterministic: true,
  };
}
