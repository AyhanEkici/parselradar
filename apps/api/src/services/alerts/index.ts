import { buildInvestorNotifications } from './buildInvestorNotifications';
import { triggerInfrastructureAlerts } from './triggerInfrastructureAlerts';
import { triggerMarketShiftAlerts } from './triggerMarketShiftAlerts';
import { triggerOpportunityAlerts } from './triggerOpportunityAlerts';

export function buildAlertNetwork(input: {
  opportunityScore?: number;
  volatilityIndex?: number;
  marketMomentum?: number;
  previousMomentum?: number;
  infrastructureImpact?: number;
  investorSignal?: string;
}) {
  const opportunityAlerts = triggerOpportunityAlerts({
    opportunityScore: input.opportunityScore,
    volatilityIndex: input.volatilityIndex,
  });

  const marketShiftAlerts = triggerMarketShiftAlerts({
    marketMomentum: input.marketMomentum,
    previousMomentum: input.previousMomentum,
    volatilityIndex: input.volatilityIndex,
  });

  const infrastructureAlerts = triggerInfrastructureAlerts({
    infrastructureImpact: input.infrastructureImpact,
  });

  const alertSignals = [...opportunityAlerts, ...marketShiftAlerts, ...infrastructureAlerts];
  const notifications = buildInvestorNotifications({
    investorSignal: input.investorSignal,
    opportunityScore: input.opportunityScore,
    volatilityIndex: input.volatilityIndex,
    alertSignals,
  });

  return {
    alertSignals,
    notifications,
    counts: {
      opportunity: opportunityAlerts.length,
      marketShift: marketShiftAlerts.length,
      infrastructure: infrastructureAlerts.length,
    },
  };
}
