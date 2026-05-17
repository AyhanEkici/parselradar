import { ROAD_ACCESS_KEYWORDS, ROAD_ACCESS_WEIGHTS } from '../../config/geo/roadAccessWeights';

export function calculateRoadAccessScore(roadAccess?: string): number {
  if (!roadAccess) return ROAD_ACCESS_WEIGHTS.unknown.score;

  const normalized = (roadAccess || '').trim().toLowerCase();

  for (const [key, keywords] of Object.entries(ROAD_ACCESS_KEYWORDS)) {
    if (keywords.some((k) => normalized.includes(k))) {
      const weight = ROAD_ACCESS_WEIGHTS[key as keyof typeof ROAD_ACCESS_WEIGHTS];
      return weight.score;
    }
  }

  return ROAD_ACCESS_WEIGHTS.unknown.score;
}
