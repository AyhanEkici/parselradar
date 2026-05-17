import { MarketHeat } from './calculateMarketHeat';
import { PricingPosition } from './calculateComparablePricing';

export type OverpricingRisk = 'LOW' | 'MEDIUM' | 'HIGH';

export function detectOverpricingRisk(input: {
  pricingPosition: PricingPosition;
  comparableCount: number;
  marketHeat: MarketHeat;
  evidenceScore: number;
}): { overpricingRisk: OverpricingRisk; riskSignals: string[] } {
  const riskSignals: string[] = [];

  if (input.pricingPosition === 'HEAVILY_OVERPRICED') {
    riskSignals.push('speculative pricing');
  } else if (input.pricingPosition === 'ABOVE_MARKET') {
    riskSignals.push('pricing above comparables');
  }

  if (input.evidenceScore < 52) {
    riskSignals.push('low confidence area');
  }

  if (input.comparableCount < 3) {
    riskSignals.push('poor comparables');
  }

  if (input.marketHeat === 'COLD' || input.comparableCount < 2) {
    riskSignals.push('sparse market evidence');
  }

  let overpricingRisk: OverpricingRisk = 'LOW';
  if (riskSignals.length >= 3) overpricingRisk = 'HIGH';
  else if (riskSignals.length >= 1) overpricingRisk = 'MEDIUM';

  return { overpricingRisk, riskSignals: Array.from(new Set(riskSignals)) };
}
