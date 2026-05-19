import { OperationalState, buildExecutionInsightBase } from '../execution/executionInsightTypes';

export function strategicStateManager(input: { source: string; timestamp: string; freshness: number; confidence: number; governanceState: string; evidenceLineage: unknown[]; readinessScore: number; pressureScore: number; }) {
  const state: OperationalState =
    input.readinessScore >= 80 && input.pressureScore <= 65 ? 'EXECUTION_COORDINATED' :
    input.readinessScore >= 60 ? 'STRATEGIC_ACTIVE' :
    input.readinessScore >= 35 ? 'MONITORING' : 'PASSIVE';
  return {
    ...buildExecutionInsightBase({ ...input }),
    operationalState: state,
  };
}
