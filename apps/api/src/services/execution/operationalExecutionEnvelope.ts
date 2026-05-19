import { executionIntelligenceEngine } from './executionIntelligenceEngine';
import { governedExecutionCoordinator } from './governedExecutionCoordinator';

export function operationalExecutionEnvelope(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  connectorDegradedCount: number;
  legalRestrictionCount: number;
  dependencyHotspots: number;
  dependencyScore: number;
  riskScore: number;
  suppression: boolean;
}) {
  const intelligence = executionIntelligenceEngine(input);
  const coordinator = governedExecutionCoordinator({
    ...input,
    executionReadiness: intelligence.readiness.executionReadiness,
  });

  return {
    source: input.source,
    timestamp: input.timestamp,
    freshness: input.freshness,
    confidence: input.confidence,
    governanceState: input.governanceState,
    evidenceLineage: input.evidenceLineage,
    inferenceLevel: 'inferred',
    executionReadiness: intelligence.readiness.executionReadiness,
    deterministic: true,
    intelligence,
    coordinator,
  };
}
