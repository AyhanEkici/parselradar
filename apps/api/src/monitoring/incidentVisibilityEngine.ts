export function incidentVisibilityEngine(input: { incidents: Array<{ id: string; severity: string; createdAt: string }> }) {
  const openIncidents = input.incidents.length;
  const criticalIncidents = input.incidents.filter((i) => i.severity === 'CRITICAL').length;
  return {
    openIncidents,
    criticalIncidents,
    latestIncidentAt: input.incidents[0]?.createdAt || null,
  };
}
