export const MARKET_VELOCITY_PROFILES = {
  illiquid: { minScore: 0, maxScore: 39, label: 'slow' },
  balanced: { minScore: 40, maxScore: 69, label: 'balanced' },
  fast: { minScore: 70, maxScore: 100, label: 'fast' },
} as const;
