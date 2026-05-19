import { buildInsightBase } from '../autonomy/autonomyInsightTypes';

export function staleConnectorDegradationVisibility(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  staleConnectors: string[];
}) {
  const base = buildInsightBase(input);
  return {
    ...base,
    staleConnectors: input.staleConnectors || [],
    staleConnectorCount: (input.staleConnectors || []).length,
    degraded: (input.staleConnectors || []).length > 0,
  };
}
