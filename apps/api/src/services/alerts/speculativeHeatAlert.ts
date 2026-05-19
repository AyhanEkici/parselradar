import { investorAlertEngine } from './investorAlertEngine';

export function speculativeHeatAlert(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  evidenceLineage: unknown[];
  governanceState: string;
  speculativeHeat: number;
}) {
  return investorAlertEngine({
    source: input.source,
    timestamp: input.timestamp,
    freshness: input.freshness,
    confidence: input.confidence,
    evidenceLineage: input.evidenceLineage || [],
    governanceState: input.governanceState,
    alertScore: Math.max(0, Math.min(100, input.speculativeHeat)),
  });
}
