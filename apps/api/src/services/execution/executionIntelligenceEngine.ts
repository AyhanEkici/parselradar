import { executionReadinessScorer } from './executionReadinessScorer';
import { executionConstraintAnalyzer } from './executionConstraintAnalyzer';
import { buildExecutionInsightBase } from './executionInsightTypes';

export function executionIntelligenceEngine(input: {
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
}) {
  const constraints = executionConstraintAnalyzer(input);
  const readiness = executionReadinessScorer({
    ...input,
    constraintScore: constraints.constraintScore,
  });

  return {
    ...buildExecutionInsightBase({ ...input, executionReadiness: readiness.executionReadiness }),
    constraints,
    readiness,
    executionScore: Math.max(0, Math.min(100, readiness.readinessScore - constraints.constraintScore * 0.2)),
  };
}
