import { SIGNAL_THRESHOLDS } from '../../config/connectors/signalThresholds';

export function detectInvestorOpportunity(input: {
  score?: number;
  marketMomentum?: number;
  districtHeat?: number;
  volatilityIndex?: number;
  overpricingRisk?: string;
}) {
  const base = (input.score || 0) * 0.36 + (input.marketMomentum || 0) * 0.24 + (input.districtHeat || 0) * 0.24;
  const volatilityPenalty = Math.max(0, (input.volatilityIndex || 0) - 52) * 0.35;
  const overpricingPenalty = String(input.overpricingRisk || 'LOW').toUpperCase() === 'HIGH'
    ? 12
    : String(input.overpricingRisk || 'LOW').toUpperCase() === 'MEDIUM'
      ? 6
      : 0;

  const opportunityScore = Math.max(0, Math.min(100, Math.round(base - volatilityPenalty - overpricingPenalty)));
  const investorSignal = opportunityScore >= SIGNAL_THRESHOLDS.investorSignal.bullish
    ? 'BULLISH'
    : opportunityScore >= SIGNAL_THRESHOLDS.investorSignal.neutral
      ? 'WATCH'
      : 'CAUTION';

  return {
    opportunityScore,
    investorSignal,
    signal: `investor_${investorSignal.toLowerCase()}`,
  };
}
