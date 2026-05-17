import { ALERT_POLICIES } from '../../config/connectors/alertPolicies';

export function triggerMarketShiftAlerts(input: {
  marketMomentum?: number;
  previousMomentum?: number;
  volatilityIndex?: number;
}) {
  const alerts: string[] = [];
  const shift = Math.abs((input.marketMomentum || 0) - (input.previousMomentum || 0));

  if (shift >= ALERT_POLICIES.marketShift.minMomentumShift) {
    alerts.push('market_momentum_shift_detected');
  }

  if ((input.volatilityIndex || 0) >= ALERT_POLICIES.marketShift.minVolatilitySpike) {
    alerts.push('volatility_spike_detected');
  }

  return alerts;
}
