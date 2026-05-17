export const ALERT_POLICIES = {
  opportunity: {
    minOpportunityScore: 72,
    maxVolatilityForStrongBuy: 68,
  },
  marketShift: {
    minMomentumShift: 16,
    minVolatilitySpike: 10,
  },
  infrastructure: {
    minInfrastructureImpact: 60,
  },
} as const;
