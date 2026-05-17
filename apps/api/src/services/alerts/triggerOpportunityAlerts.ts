import { ALERT_POLICIES } from '../../config/connectors/alertPolicies';

export function triggerOpportunityAlerts(input: {
  opportunityScore?: number;
  volatilityIndex?: number;
}) {
  const alerts: string[] = [];
  if ((input.opportunityScore || 0) >= ALERT_POLICIES.opportunity.minOpportunityScore) {
    alerts.push('opportunity_score_threshold_crossed');
  }
  if (
    (input.opportunityScore || 0) >= ALERT_POLICIES.opportunity.minOpportunityScore &&
    (input.volatilityIndex || 0) <= ALERT_POLICIES.opportunity.maxVolatilityForStrongBuy
  ) {
    alerts.push('opportunity_window_actionable');
  }
  return alerts;
}
