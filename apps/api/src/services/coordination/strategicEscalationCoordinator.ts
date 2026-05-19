import { buildExecutionInsightBase } from '../execution/executionInsightTypes';

export function strategicEscalationCoordinator(input: { source: string; timestamp: string; freshness: number; confidence: number; governanceState: string; evidenceLineage: unknown[]; escalationEvents: number; hiddenEscalationDetected?: boolean; }) {
  return {
    ...buildExecutionInsightBase({ ...input }),
    escalationEvents: input.escalationEvents,
    hiddenEscalationDetected: Boolean(input.hiddenEscalationDetected),
    strategicEscalationVisible: true,
  };
}
