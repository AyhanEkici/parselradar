export const DEVELOPER_ROI_THRESHOLDS = {
  conservative: {
    minScore: 40,
    maxScore: 59,
    label: 'Conservative',
    description: 'Low risk, modest returns',
  },
  moderate: {
    minScore: 60,
    maxScore: 79,
    label: 'Moderate',
    description: 'Balanced risk-return profile',
  },
  aggressive: {
    minScore: 80,
    maxScore: 100,
    label: 'Aggressive',
    description: 'Higher risk, significant upside',
  },
} as const;

export const ROI_SCORE_FACTORS = {
  parcelSizeBonus: 15,
  densityPotentialWeight: 0.3,
  marketHeatWeight: 0.25,
  infraReadinessWeight: 0.2,
  rezoningUpsideWeight: 0.15,
  projectabilityWeight: 0.1,
} as const;
