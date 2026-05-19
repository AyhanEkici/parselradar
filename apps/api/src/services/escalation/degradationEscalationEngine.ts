import { buildInsightBase } from '../autonomy/autonomyInsightTypes';

export function degradationEscalationEngine(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  degradedConnectorCount: number;
  noFakeActiveProof: boolean;
}) {
  const base = buildInsightBase(input);
  const score = input.degradedConnectorCount * 20 + (input.noFakeActiveProof ? 0 : 30);
  const escalation = score >= 80 ? 'CRITICAL' : score >= 60 ? 'HIGH_PRIORITY' : score >= 40 ? 'IMPORTANT' : score >= 20 ? 'NOTICE' : 'INFO';
  return { ...base, escalation, degradedConnectorCount: input.degradedConnectorCount, staleConnectorDegradationVisibility: input.degradedConnectorCount > 0 };
}
