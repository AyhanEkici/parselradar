import { ComparableParcel } from './findComparableParcels';

export type PricingPosition = 'UNDER_MARKET' | 'FAIR_MARKET' | 'ABOVE_MARKET' | 'HEAVILY_OVERPRICED';

export type ComparablePricingResult = {
  comparableCount: number;
  avgComparablePricePerM2: number;
  medianComparablePricePerM2: number;
  subjectPricePerM2: number;
  pricingDeltaRatio: number;
  pricingPosition: PricingPosition;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function calculateComparablePricing(input: { subjectPricePerM2: number; comparables: ComparableParcel[] }): ComparablePricingResult {
  const values = input.comparables.map((c) => c.normalizedPricePerM2).filter((v) => v > 0);
  const comparableCount = values.length;

  if (comparableCount === 0) {
    return {
      comparableCount: 0,
      avgComparablePricePerM2: input.subjectPricePerM2,
      medianComparablePricePerM2: input.subjectPricePerM2,
      subjectPricePerM2: input.subjectPricePerM2,
      pricingDeltaRatio: 0,
      pricingPosition: 'FAIR_MARKET',
    };
  }

  const avg = Math.round(values.reduce((sum, v) => sum + v, 0) / comparableCount);
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0 ? Math.round((sorted[middle - 1] + sorted[middle]) / 2) : sorted[middle];

  const baseline = Math.max(1, avg);
  const delta = (input.subjectPricePerM2 - baseline) / baseline;

  let pricingPosition: PricingPosition = 'FAIR_MARKET';
  if (delta <= -0.12) pricingPosition = 'UNDER_MARKET';
  else if (delta >= 0.28) pricingPosition = 'HEAVILY_OVERPRICED';
  else if (delta >= 0.12) pricingPosition = 'ABOVE_MARKET';

  return {
    comparableCount,
    avgComparablePricePerM2: avg,
    medianComparablePricePerM2: median,
    subjectPricePerM2: Math.round(clamp(input.subjectPricePerM2, 1, 10_000_000)),
    pricingDeltaRatio: Number(delta.toFixed(3)),
    pricingPosition,
  };
}
