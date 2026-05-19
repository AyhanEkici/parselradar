import { AnomalyLevel } from './speculativeAnomalyDetector';

export function suspiciousMarketVelocity(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  evidenceLineage: unknown[];
  governanceState: string;
  velocityScore: number;
  liquidityScore: number;
}) {
  const score = Math.max(0, Math.min(100, (input.velocityScore || 0) * 0.65 + (100 - (input.liquidityScore || 0)) * 0.35));
  const level: AnomalyLevel = score >= 85 ? 'CRITICAL' : score >= 70 ? 'HIGH' : score >= 50 ? 'MODERATE' : score >= 30 ? 'LOW' : 'NONE';

  return {
    source: input.source,
    timestamp: input.timestamp,
    freshness: input.freshness,
    confidence: input.confidence,
    evidenceLineage: input.evidenceLineage || [],
    governanceState: input.governanceState,
    level,
    velocityRiskScore: score,
    deterministic: true,
  };
}
