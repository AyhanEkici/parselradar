export const LIQUIDITY_BASE_BY_MARKET_POSITION = {
  DEEP_DISCOUNT: 80,
  DISCOUNT: 85,
  FAIR: 82,
  PREMIUM: 58,
  STRETCHED: 38,
} as const;

export const LIQUIDITY_AREA_ADJUSTMENTS = {
  verySmallThresholdM2: 200,
  verySmallAdjustment: -8,
  idealMinM2: 250,
  idealMaxM2: 12000,
  idealAdjustment: 6,
  largeThresholdM2: 30000,
  largeAdjustment: -12,
  veryLargeThresholdM2: 50000,
  veryLargeAdjustment: -18,
};

export const LIQUIDITY_DOCUMENT_ADJUSTMENTS = {
  minDocsForHighConfidence: 3,
  minDocsForBaseline: 2,
  adjustmentBelowBaseline: -8,
  adjustmentStrongDocs: 5,
};

export const LIQUIDITY_SIGNAL_THRESHOLDS = {
  HIGH: 76,
  MEDIUM: 52,
};
