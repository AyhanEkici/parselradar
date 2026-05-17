import { ALERT_POLICIES } from '../../config/connectors/alertPolicies';

export function triggerInfrastructureAlerts(input: { infrastructureImpact?: number }) {
  const alerts: string[] = [];
  if ((input.infrastructureImpact || 0) >= ALERT_POLICIES.infrastructure.minInfrastructureImpact) {
    alerts.push('infrastructure_impact_elevated');
  }
  return alerts;
}
