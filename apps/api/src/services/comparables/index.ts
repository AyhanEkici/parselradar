import { calculateMarketPosition } from '../analysis/calculateMarketPosition';
import { calculateMarketHeat } from './calculateMarketHeat';
import { calculateComparablePricing } from './calculateComparablePricing';
import { detectInvestmentOpportunity } from './detectInvestmentOpportunity';
import { detectOverpricingRisk } from './detectOverpricingRisk';
import { buildComparableSummary } from './buildComparableSummary';
import { findComparableParcels, ComparableParcelRecord } from './findComparableParcels';

export type ComparableMarketOutput = {
  comparableCount: number;
  avgComparablePricePerM2: number;
  marketHeat: 'COLD' | 'STABLE' | 'ACTIVE' | 'HOT';
  pricingPosition: 'UNDER_MARKET' | 'FAIR_MARKET' | 'ABOVE_MARKET' | 'HEAVILY_OVERPRICED';
  opportunitySignals: string[];
  overpricingRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  comparableSummary: string;
  topComparables: Array<{
    _id: string;
    il?: string;
    ilce?: string;
    zoningStatus?: string;
    areaM2?: number;
    normalizedPricePerM2: number;
    similarityScore: number;
    priceDeltaRatio: number;
    daysSinceCreated: number;
  }>;
  riskSignals: string[];
  pricingDeltaRatio: number;
  medianComparablePricePerM2: number;
};

function normalize(value?: string) {
  return (value || '').trim().toLowerCase();
}

function hasNegative(value?: string) {
  const v = normalize(value);
  return v.includes('no') || v.includes('none') || v.includes('yok') || v.includes('uzak');
}

function infrastructureScore(record: ComparableParcelRecord) {
  let score = 40;
  score += hasNegative(record.roadAccess) ? -20 : 20;
  score += hasNegative(record.electricity) ? -15 : 20;
  score += hasNegative(record.water) ? -15 : 20;
  return Math.max(0, Math.min(100, score));
}

function subjectPricePerM2(subject: ComparableParcelRecord) {
  const market = calculateMarketPosition({
    il: subject.il,
    ilce: subject.ilce,
    areaM2: subject.areaM2,
    askingPriceTRY: subject.askingPriceTRY,
    pricePerM2: subject.pricePerM2,
    docCount: 0,
  });
  return market.subjectPricePerM2;
}

export function buildComparableMarketIntelligence(input: {
  subject: ComparableParcelRecord;
  candidates: ComparableParcelRecord[];
}): ComparableMarketOutput {
  const topComparables = findComparableParcels({
    subject: input.subject,
    candidates: input.candidates,
    maxResults: 8,
  });

  const subjectPpm2 = subjectPricePerM2(input.subject);
  const pricing = calculateComparablePricing({
    subjectPricePerM2: subjectPpm2,
    comparables: topComparables,
  });

  const heat = calculateMarketHeat({ comparables: topComparables });

  const opportunitySignals = detectInvestmentOpportunity({
    pricingPosition: pricing.pricingPosition,
    marketHeat: heat.marketHeat,
    developerFit: undefined,
    liquiditySignal: undefined,
    infrastructureScore: infrastructureScore(input.subject),
  });

  const overpricing = detectOverpricingRisk({
    pricingPosition: pricing.pricingPosition,
    comparableCount: pricing.comparableCount,
    marketHeat: heat.marketHeat,
    evidenceScore: heat.evidenceScore,
  });

  const comparableSummary = buildComparableSummary({
    comparableCount: pricing.comparableCount,
    avgComparablePricePerM2: pricing.avgComparablePricePerM2,
    pricingPosition: pricing.pricingPosition,
    marketHeat: heat.marketHeat,
    opportunitySignals,
    overpricingRisk: overpricing.overpricingRisk,
  });

  return {
    comparableCount: pricing.comparableCount,
    avgComparablePricePerM2: pricing.avgComparablePricePerM2,
    marketHeat: heat.marketHeat,
    pricingPosition: pricing.pricingPosition,
    opportunitySignals,
    overpricingRisk: overpricing.overpricingRisk,
    comparableSummary,
    topComparables: topComparables.map((c) => ({
      _id: String(c._id),
      il: c.il,
      ilce: c.ilce,
      zoningStatus: c.zoningStatus,
      areaM2: c.areaM2,
      normalizedPricePerM2: c.normalizedPricePerM2,
      similarityScore: c.similarityScore,
      priceDeltaRatio: c.priceDeltaRatio,
      daysSinceCreated: c.daysSinceCreated,
    })),
    riskSignals: overpricing.riskSignals,
    pricingDeltaRatio: pricing.pricingDeltaRatio,
    medianComparablePricePerM2: pricing.medianComparablePricePerM2,
  };
}

export { findComparableParcels } from './findComparableParcels';
export { calculateComparablePricing } from './calculateComparablePricing';
export { calculateMarketHeat } from './calculateMarketHeat';
export { detectInvestmentOpportunity } from './detectInvestmentOpportunity';
export { detectOverpricingRisk } from './detectOverpricingRisk';
export { buildComparableSummary } from './buildComparableSummary';
