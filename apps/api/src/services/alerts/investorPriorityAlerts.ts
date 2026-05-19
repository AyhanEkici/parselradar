import { governedAlertRouter } from './governedAlertRouter';

export function investorPriorityAlerts(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  investorPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  suppressed?: boolean;
}) {
  const severity = input.investorPriority === 'CRITICAL' ? 'CRITICAL' : input.investorPriority === 'HIGH' ? 'HIGH_PRIORITY' : input.investorPriority === 'MEDIUM' ? 'IMPORTANT' : 'NOTICE';
  return governedAlertRouter({
    source: input.source,
    timestamp: input.timestamp,
    freshness: input.freshness,
    confidence: input.confidence,
    governanceState: input.governanceState,
    evidenceLineage: input.evidenceLineage,
    severity,
    suppressed: input.suppressed,
  });
}
