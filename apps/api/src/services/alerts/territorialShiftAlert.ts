import { investorAlertEngine } from './investorAlertEngine';

export function territorialShiftAlert(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  evidenceLineage: unknown[];
  governanceState: string;
  shiftScore: number;
}) {
  return investorAlertEngine({
    source: input.source,
    timestamp: input.timestamp,
    freshness: input.freshness,
    confidence: input.confidence,
    evidenceLineage: input.evidenceLineage || [],
    governanceState: input.governanceState,
    alertScore: input.shiftScore,
  });
}
