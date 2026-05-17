import { DISTRICT_KEYWORD_MULTIPLIERS, DEFAULT_DISTRICT_MULTIPLIER } from '../../config/analysis/districtMultipliers';
import {
  LIQUIDITY_AREA_ADJUSTMENTS,
  LIQUIDITY_BASE_BY_MARKET_POSITION,
  LIQUIDITY_DOCUMENT_ADJUSTMENTS,
  LIQUIDITY_SIGNAL_THRESHOLDS,
} from '../../config/analysis/liquidityWeights';
import { DISTRICT_TIER_MULTIPLIERS, REGION_VALUATION_MATRIX, VALUATION_BAND_WIDTH } from '../../config/analysis/valuationMatrix';

type MarketPositionInput = {
  il?: string;
  ilce?: string;
  areaM2?: number;
  askingPriceTRY?: number;
  pricePerM2?: number;
  docCount: number;
};

export type MarketPositionResult = {
  comparablePricePerM2: number;
  subjectPricePerM2: number;
  priceDeviationRatio: number;
  marketPosition: 'DEEP_DISCOUNT' | 'DISCOUNT' | 'FAIR' | 'PREMIUM' | 'STRETCHED';
  valuationBand: {
    low: number;
    mid: number;
    high: number;
    currency: 'TRY';
  };
  liquiditySignal: 'HIGH' | 'MEDIUM' | 'LOW';
  pricingConfidence: number;
};

function normalize(value?: string) {
  return (value || '').trim().toLowerCase();
}

function districtMultiplier(ilce?: string) {
  const district = normalize(ilce);
  if (!district) return DEFAULT_DISTRICT_MULTIPLIER;

  if (DISTRICT_KEYWORD_MULTIPLIERS.premium.keywords.some((k) => district.includes(k))) {
    return DISTRICT_KEYWORD_MULTIPLIERS.premium.multiplier;
  }

  if (DISTRICT_KEYWORD_MULTIPLIERS.rural.keywords.some((k) => district.includes(k))) {
    return DISTRICT_KEYWORD_MULTIPLIERS.rural.multiplier;
  }

  if (DISTRICT_KEYWORD_MULTIPLIERS.cityEdge.keywords.some((k) => district.includes(k))) {
    return DISTRICT_KEYWORD_MULTIPLIERS.cityEdge.multiplier;
  }

  if (DISTRICT_KEYWORD_MULTIPLIERS.industrial.keywords.some((k) => district.includes(k))) {
    return DISTRICT_KEYWORD_MULTIPLIERS.industrial.multiplier;
  }

  return DEFAULT_DISTRICT_MULTIPLIER;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function liquiditySignalFromScore(score: number): MarketPositionResult['liquiditySignal'] {
  if (score >= LIQUIDITY_SIGNAL_THRESHOLDS.HIGH) return 'HIGH';
  if (score >= LIQUIDITY_SIGNAL_THRESHOLDS.MEDIUM) return 'MEDIUM';
  return 'LOW';
}

function liquidityScore(input: { marketPosition: MarketPositionResult['marketPosition']; areaM2?: number; docCount: number }) {
  let score = LIQUIDITY_BASE_BY_MARKET_POSITION[input.marketPosition];

  if (typeof input.areaM2 === 'number' && input.areaM2 > 0) {
    if (input.areaM2 < LIQUIDITY_AREA_ADJUSTMENTS.verySmallThresholdM2) {
      score += LIQUIDITY_AREA_ADJUSTMENTS.verySmallAdjustment;
    } else if (
      input.areaM2 >= LIQUIDITY_AREA_ADJUSTMENTS.idealMinM2 &&
      input.areaM2 <= LIQUIDITY_AREA_ADJUSTMENTS.idealMaxM2
    ) {
      score += LIQUIDITY_AREA_ADJUSTMENTS.idealAdjustment;
    } else if (input.areaM2 > LIQUIDITY_AREA_ADJUSTMENTS.veryLargeThresholdM2) {
      score += LIQUIDITY_AREA_ADJUSTMENTS.veryLargeAdjustment;
    } else if (input.areaM2 > LIQUIDITY_AREA_ADJUSTMENTS.largeThresholdM2) {
      score += LIQUIDITY_AREA_ADJUSTMENTS.largeAdjustment;
    }
  }

  if (input.docCount < LIQUIDITY_DOCUMENT_ADJUSTMENTS.minDocsForBaseline) {
    score += LIQUIDITY_DOCUMENT_ADJUSTMENTS.adjustmentBelowBaseline;
  } else if (input.docCount >= LIQUIDITY_DOCUMENT_ADJUSTMENTS.minDocsForHighConfidence) {
    score += LIQUIDITY_DOCUMENT_ADJUSTMENTS.adjustmentStrongDocs;
  }

  return clamp(score, 0, 100);
}

export function calculateMarketPosition(input: MarketPositionInput): MarketPositionResult {
  const cityKey = normalize(input.il);
  const cityBase = REGION_VALUATION_MATRIX[cityKey]?.basePricePerM2 || REGION_VALUATION_MATRIX.default.basePricePerM2;
  let comparablePricePerM2 = cityBase;

  const districtMul = districtMultiplier(input.ilce);
  comparablePricePerM2 = Math.round(comparablePricePerM2 * districtMul);

  if (districtMul >= DISTRICT_TIER_MULTIPLIERS.CITY_CORE) {
    comparablePricePerM2 = Math.round(comparablePricePerM2 * 1.02);
  } else if (districtMul <= DISTRICT_TIER_MULTIPLIERS.RURAL) {
    comparablePricePerM2 = Math.round(comparablePricePerM2 * 0.98);
  }

  const derivedSubjectPrice =
    typeof input.pricePerM2 === 'number' && input.pricePerM2 > 0
      ? input.pricePerM2
      : typeof input.askingPriceTRY === 'number' && input.askingPriceTRY > 0 && typeof input.areaM2 === 'number' && input.areaM2 > 0
      ? input.askingPriceTRY / input.areaM2
      : comparablePricePerM2;

  const subjectPricePerM2 = Math.round(derivedSubjectPrice);
  const priceDeviationRatio = (subjectPricePerM2 - comparablePricePerM2) / comparablePricePerM2;

  let marketPosition: MarketPositionResult['marketPosition'] = 'FAIR';
  if (priceDeviationRatio <= -0.25) marketPosition = 'DEEP_DISCOUNT';
  else if (priceDeviationRatio <= -0.1) marketPosition = 'DISCOUNT';
  else if (priceDeviationRatio >= 0.35) marketPosition = 'STRETCHED';
  else if (priceDeviationRatio >= 0.12) marketPosition = 'PREMIUM';

  const areaForValuation = typeof input.areaM2 === 'number' && input.areaM2 > 0 ? input.areaM2 : 1000;
  const mid = Math.round(comparablePricePerM2 * areaForValuation);
  const low = Math.round(mid * VALUATION_BAND_WIDTH.lowFactor);
  const high = Math.round(mid * VALUATION_BAND_WIDTH.highFactor);

  const liqScore = liquidityScore({ marketPosition, areaM2: input.areaM2, docCount: input.docCount });
  const liquiditySignal = liquiditySignalFromScore(liqScore);

  const pricingConfidenceBase =
    typeof input.pricePerM2 === 'number' && input.pricePerM2 > 0
      ? 82
      : typeof input.askingPriceTRY === 'number' && typeof input.areaM2 === 'number'
      ? 72
      : 55;

  const pricingConfidence = clamp(pricingConfidenceBase + Math.min(10, input.docCount * 2), 40, 95);

  return {
    comparablePricePerM2,
    subjectPricePerM2,
    priceDeviationRatio: Number(priceDeviationRatio.toFixed(3)),
    marketPosition,
    valuationBand: { low, mid, high, currency: 'TRY' },
    liquiditySignal,
    pricingConfidence,
  };
}
