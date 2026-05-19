import { buildExecutionInsightBase } from './executionInsightTypes';

export function executionConstraintAnalyzer(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  connectorDegradedCount: number;
  legalRestrictionCount: number;
  dependencyHotspots: number;
}) {
  const constraintScore = Math.max(0, Math.min(100, input.connectorDegradedCount * 20 + input.legalRestrictionCount * 15 + input.dependencyHotspots * 12));
  return {
    ...buildExecutionInsightBase({ ...input }),
    constraintScore,
    constraints: {
      connectorDegradedCount: input.connectorDegradedCount,
      legalRestrictionCount: input.legalRestrictionCount,
      dependencyHotspots: input.dependencyHotspots,
    },
  };
}
