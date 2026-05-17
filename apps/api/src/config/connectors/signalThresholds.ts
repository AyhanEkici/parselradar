export const SIGNAL_THRESHOLDS = {
  momentum: {
    high: 75,
    medium: 55,
  },
  acceleration: {
    strong: 0.14,
    moderate: 0.06,
  },
  districtHeat: {
    hot: 72,
    warm: 52,
  },
  investorSignal: {
    bullish: 70,
    neutral: 45,
  },
  volatility: {
    elevated: 62,
    high: 78,
  },
  opportunity: {
    strong: 74,
    moderate: 56,
  },
} as const;
