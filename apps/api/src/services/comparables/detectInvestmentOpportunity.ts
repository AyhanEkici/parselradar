import { MarketHeat } from './calculateMarketHeat';
import { PricingPosition } from './calculateComparablePricing';

export function detectInvestmentOpportunity(input: {
  pricingPosition: PricingPosition;
  marketHeat: MarketHeat;
  developerFit?: string;
  liquiditySignal?: string;
  infrastructureScore?: number;
}): string[] {
  const signals: string[] = [];

  if (input.pricingPosition === 'UNDER_MARKET') {
    signals.push('undervalued candidate');
  }

  if ((input.developerFit || '').toUpperCase().includes('HIGH')) {
    signals.push('developer opportunity');
  }

  if (typeof input.infrastructureScore === 'number' && input.infrastructureScore >= 70) {
    signals.push('infrastructure upside');
  }

  const liquidityUpper = (input.liquiditySignal || '').toUpperCase();
  if (liquidityUpper.includes('HIGH') || input.marketHeat === 'ACTIVE' || input.marketHeat === 'HOT') {
    signals.push('liquidity upside');
  }

  return Array.from(new Set(signals));
}
