export type InferenceLevelV28 = 'verified' | 'inferred' | 'estimated' | 'unavailable';
export type AutonomyState = 'MANUAL_ONLY' | 'ASSISTED' | 'GOVERNED_AUTONOMOUS' | 'RESTRICTED';
export type InvestorPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type StrategicRegionState = 'OBSERVE' | 'WATCH' | 'STRATEGIC' | 'TRANSFORMATION_ZONE';
export type FeedSeverity = 'INFO' | 'NOTICE' | 'IMPORTANT' | 'HIGH_PRIORITY' | 'CRITICAL';
export type PortfolioExposure = 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK' | 'CONCENTRATED';

export type InsightBase = {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  inferenceLevel: InferenceLevelV28;
  deterministic: true;
};

export function buildInsightBase(input: {
  source: string;
  timestamp: string;
  freshness?: number;
  confidence?: number;
  governanceState?: string;
  evidenceLineage?: unknown[];
  inferenceLevel?: InferenceLevelV28;
}): InsightBase {
  return {
    source: input.source,
    timestamp: input.timestamp,
    freshness: Math.max(0, Math.min(100, Number(input.freshness || 0))),
    confidence: Math.max(0, Math.min(100, Number(input.confidence || 0))),
    governanceState: input.governanceState || 'RESTRICTED',
    evidenceLineage: input.evidenceLineage || [],
    inferenceLevel: input.inferenceLevel || 'inferred',
    deterministic: true,
  };
}
