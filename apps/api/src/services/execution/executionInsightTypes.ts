export type ExecutionReadiness = 'NOT_READY' | 'LIMITED' | 'PREPARING' | 'READY' | 'STRATEGIC_READY';
export type DecisionConfidence = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
export type StrategicDirection = 'OBSERVE' | 'POSITIONING' | 'ACCUMULATING' | 'STRATEGIC_EXPANSION';
export type ExecutionRisk = 'MINIMAL' | 'MANAGEABLE' | 'ELEVATED' | 'CRITICAL';
export type OperationalState = 'PASSIVE' | 'MONITORING' | 'STRATEGIC_ACTIVE' | 'EXECUTION_COORDINATED';

export type ExecutionInsightBase = {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  inferenceLevel: 'verified' | 'inferred' | 'estimated' | 'unavailable';
  executionReadiness: ExecutionReadiness;
  deterministic: true;
};

export function buildExecutionInsightBase(input: {
  source: string;
  timestamp: string;
  freshness?: number;
  confidence?: number;
  governanceState?: string;
  evidenceLineage?: unknown[];
  inferenceLevel?: 'verified' | 'inferred' | 'estimated' | 'unavailable';
  executionReadiness?: ExecutionReadiness;
}): ExecutionInsightBase {
  return {
    source: input.source,
    timestamp: input.timestamp,
    freshness: Math.max(0, Math.min(100, Number(input.freshness || 0))),
    confidence: Math.max(0, Math.min(100, Number(input.confidence || 0))),
    governanceState: input.governanceState || 'RESTRICTED',
    evidenceLineage: input.evidenceLineage || [],
    inferenceLevel: input.inferenceLevel || 'inferred',
    executionReadiness: input.executionReadiness || 'NOT_READY',
    deterministic: true,
  };
}
