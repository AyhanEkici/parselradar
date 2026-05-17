export const INGESTION_THRESHOLDS = {
  staleHours: {
    market: 36,
    spatial: 72,
    analysis: 24,
  },
  freshnessScore: {
    verifiedBase: 84,
    mediumBase: 66,
    lowBase: 42,
    stalePenalty: 18,
  },
  dedupeTolerance: {
    areaM2: 50,
    pricePerM2: 750,
  },
} as const;
