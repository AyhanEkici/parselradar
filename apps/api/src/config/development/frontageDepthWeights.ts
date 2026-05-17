export const FRONTAGE_DEPTH_WEIGHTS = {
  baseScore: 52,
  roadAccessBonus: {
    highway: 18,
    anayol: 12,
    arterial: 9,
    local: 4,
    village: -10,
    unknown: 0,
  },
  areaBands: {
    compact: { max: 700, score: -8 },
    balanced: { max: 2500, score: 12 },
    deep: { max: 5000, score: 4 },
    oversized: { max: Number.POSITIVE_INFINITY, score: -6 },
  },
  cornerKeywordBonus: 8,
  narrowKeywordPenalty: -10,
  deepShapePenalty: -8,
} as const;

export const GEOMETRY_HEURISTIC_KEYWORDS = {
  corner: ['corner', 'kose', 'köşe', 'bulvar', 'cadde'],
  narrow: ['dar', 'narrow', 'ince'],
  deep: ['derin', 'deep', 'uzun'],
} as const;
