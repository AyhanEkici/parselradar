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

const CITY_BASELINE_PPM2: Record<string, number> = {
  istanbul: 45000,
  ankara: 30000,
  izmir: 36000,
  bursa: 24000,
  antalya: 38000,
  adana: 22000,
  konya: 20000,
  gaziantep: 21000,
  default: 18000,
};

function normalize(value?: string) {
  return (value || '').trim().toLowerCase();
}

function districtMultiplier(ilce?: string) {
  const district = normalize(ilce);
  if (!district) return 1;

  const premiumKeywords = ['merkez', 'center', 'sahil', 'beach', 'kadikoy', 'besiktas', 'sisli', 'bornova'];
  const discountKeywords = ['kirsal', 'koy', 'village', 'sanayi'];

  if (premiumKeywords.some((k) => district.includes(k))) return 1.15;
  if (discountKeywords.some((k) => district.includes(k))) return 0.9;
  return 1;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function calculateMarketPosition(input: MarketPositionInput): MarketPositionResult {
  const cityKey = normalize(input.il);
  const cityBase = CITY_BASELINE_PPM2[cityKey] || CITY_BASELINE_PPM2.default;
  const comparablePricePerM2 = Math.round(cityBase * districtMultiplier(input.ilce));

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
  const low = Math.round(mid * 0.9);
  const high = Math.round(mid * 1.1);

  let liquiditySignal: MarketPositionResult['liquiditySignal'] = 'MEDIUM';
  if (marketPosition === 'DISCOUNT' || marketPosition === 'FAIR') liquiditySignal = 'HIGH';
  if (marketPosition === 'STRETCHED') liquiditySignal = 'LOW';
  if (typeof input.areaM2 === 'number' && input.areaM2 > 30000) liquiditySignal = 'LOW';
  if (input.docCount < 2 && liquiditySignal === 'HIGH') liquiditySignal = 'MEDIUM';

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
