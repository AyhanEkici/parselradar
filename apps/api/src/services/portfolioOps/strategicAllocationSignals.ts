import { buildInsightBase } from '../autonomy/autonomyInsightTypes';

export function strategicAllocationSignals(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  allocationSignals: string[];
}) {
  const base = buildInsightBase(input);
  return { ...base, allocationSignals: input.allocationSignals || [], signalCount: (input.allocationSignals || []).length };
}
