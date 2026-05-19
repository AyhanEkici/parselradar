import { buildExecutionInsightBase } from '../execution/executionInsightTypes';

export function operationalSignalBus(input: { source: string; timestamp: string; freshness: number; confidence: number; governanceState: string; evidenceLineage: unknown[]; signals: string[]; }) {
  return {
    ...buildExecutionInsightBase({ ...input }),
    signals: input.signals || [],
    signalCount: (input.signals || []).length,
  };
}
