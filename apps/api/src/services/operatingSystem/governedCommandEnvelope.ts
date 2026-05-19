import { buildExecutionInsightBase } from '../execution/executionInsightTypes';

export function governedCommandEnvelope(input: { source: string; timestamp: string; freshness: number; confidence: number; governanceState: string; evidenceLineage: unknown[]; command: string; readiness: string; }) {
  const allowed = input.governanceState === 'ALLOW' && (input.readiness === 'READY' || input.readiness === 'STRATEGIC_READY');
  return {
    ...buildExecutionInsightBase({ ...input, executionReadiness: input.readiness as any }),
    command: input.command,
    commandState: allowed ? 'REVIEW_REQUIRED' : 'BLOCKED',
    noUncontrolledExecutionAuthority: true,
  };
}
