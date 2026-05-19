import { investorAlertEngine } from './investorAlertEngine';

export function zoningChangeAlert(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  evidenceLineage: unknown[];
  governanceState: string;
  zoningChanged: boolean;
}) {
  return investorAlertEngine({
    source: input.source,
    timestamp: input.timestamp,
    freshness: input.freshness,
    confidence: input.confidence,
    evidenceLineage: input.evidenceLineage || [],
    governanceState: input.governanceState,
    alertScore: input.zoningChanged ? 72 : 18,
  });
}
