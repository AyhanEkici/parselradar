import { investorAlertEngine } from './investorAlertEngine';

export function infrastructureAnnouncementAlert(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  evidenceLineage: unknown[];
  governanceState: string;
  announcementCount: number;
}) {
  return investorAlertEngine({
    source: input.source,
    timestamp: input.timestamp,
    freshness: input.freshness,
    confidence: input.confidence,
    evidenceLineage: input.evidenceLineage || [],
    governanceState: input.governanceState,
    alertScore: Math.max(0, Math.min(100, input.announcementCount * 22)),
  });
}
