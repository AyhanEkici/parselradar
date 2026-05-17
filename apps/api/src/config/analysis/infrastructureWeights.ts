export const INFRASTRUCTURE_WEIGHTS = {
  roadAccess: 0.42,
  electricity: 0.3,
  water: 0.28,
};

export const INFRASTRUCTURE_SCORE_COMPONENTS = {
  baseScore: 35,
  roadPositive: 25,
  electricityPositive: 20,
  waterPositive: 20,
  missingPenalty: 12,
};

export const ROAD_PROXIMITY_KEYWORDS = {
  strong: ['anayol', 'main road', 'boulevard', 'highway', 'otoyol', 'arter'],
  medium: ['yol', 'road', 'street', 'cadde', 'sokak'],
  weak: ['no', 'none', 'yok', 'uzak', 'far'],
};

export const ROAD_PROXIMITY_SCORES = {
  strong: 90,
  medium: 72,
  weak: 35,
  unknown: 50,
};
