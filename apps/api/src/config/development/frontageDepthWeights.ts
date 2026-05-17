export const FRONTAGE_DEPTH_WEIGHTS = {
  frontageDesirability: {
    excellent: { minM: 30, score: 90 },
    good: { minM: 20, score: 75 },
    adequate: { minM: 10, score: 60 },
    narrow: { minM: 0, score: 40 },
  },
  depthPenalties: {
    shallowPenalty: { maxM: 15, penalty: 25 },
    moderatePenalty: { maxM: 30, penalty: 10 },
    deepParcelPenalty: { maxM: 50, penalty: 15 },
    extremelyDeepPenalty: { maxM: 10000, penalty: 30 },
  },
  cornerBonus: 15,
  rectangularityBonus: 10,
  irregularShapePenalty: 20,
} as const;

export const FRONTAGE_DEPTH_SCORE_FACTORS = {
  frontageWeight: 0.35,
  depthWeight: 0.35,
  cornerWeight: 0.15,
  regularityWeight: 0.15,
} as const;
