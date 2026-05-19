export type IngestionAuditEvent = {
  connectorKey: string;
  action: 'FETCH' | 'SKIP' | 'RETRY' | 'FAIL' | 'SUCCESS';
  timestamp: string;
  status: string;
  governanceState: string;
  legalClassification: string;
  notes: string[];
};

export function ingestionAuditTrail(events: IngestionAuditEvent[]) {
  return {
    totalEvents: events.length,
    latestEvents: events.slice(-20),
    hasFailures: events.some((e) => e.action === 'FAIL'),
  };
}
