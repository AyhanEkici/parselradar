import { MarketHeat } from './calculateMarketHeat';
import { PricingPosition } from './calculateComparablePricing';
import { OverpricingRisk } from './detectOverpricingRisk';

export function buildComparableSummary(input: {
  comparableCount: number;
  avgComparablePricePerM2: number;
  pricingPosition: PricingPosition;
  marketHeat: MarketHeat;
  opportunitySignals: string[];
  overpricingRisk: OverpricingRisk;
}): string {
  const signalText = input.opportunitySignals.length > 0 ? input.opportunitySignals.join(', ') : 'no clear opportunity signal';

  return (
    `Comparable evidence: ${input.comparableCount} parcels, average ${input.avgComparablePricePerM2.toLocaleString('tr-TR')} TRY/m². ` +
    `Pricing position is ${input.pricingPosition.toLowerCase().replace('_', ' ')} with ${input.marketHeat.toLowerCase()} market heat. ` +
    `Opportunity profile: ${signalText}. Overpricing risk: ${input.overpricingRisk.toLowerCase()}.`
  );
}
