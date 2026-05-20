import { securityOperationsEngine } from './securityOperationsEngine';
import { incidentVisibilityEngine } from './incidentVisibilityEngine';

export function operationalSecurityDashboard(input: {
  threatSignals: number;
  blockedEvents: number;
  suspiciousSessions: number;
  incidents: Array<{ id: string; severity: string; createdAt: string }>;
}) {
  const operations = securityOperationsEngine({
    threatSignals: input.threatSignals,
    blockedEvents: input.blockedEvents,
    suspiciousSessions: input.suspiciousSessions,
  });
  const incidents = incidentVisibilityEngine({ incidents: input.incidents });

  return {
    generatedAt: new Date().toISOString(),
    operations,
    incidents,
  };
}
