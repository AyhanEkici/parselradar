import { buildExecutionInsightBase } from './executionInsightTypes';

export function governedExecutionCoordinator(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  executionReadiness: 'NOT_READY' | 'LIMITED' | 'PREPARING' | 'READY' | 'STRATEGIC_READY';
  suppression: boolean;
}) {
  const base = buildExecutionInsightBase({ ...input, executionReadiness: input.executionReadiness });
  const allowed = !input.suppression && input.governanceState === 'ALLOW' && (input.executionReadiness === 'READY' || input.executionReadiness === 'STRATEGIC_READY');
  return {
    ...base,
    operationalAuthority: 'HUMAN_GOVERNED',
    hiddenEscalationDetected: false,
    actionState: allowed ? 'REVIEW_REQUIRED' : 'BLOCKED',
    noUncontrolledExecutionAuthority: true,
  };
}
