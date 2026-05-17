import {
  INFRASTRUCTURE_SCORE_COMPONENTS,
  INFRASTRUCTURE_WEIGHTS,
  ROAD_PROXIMITY_KEYWORDS,
  ROAD_PROXIMITY_SCORES,
} from '../../config/analysis/infrastructureWeights';
import { DEFAULT_ZONING_PROFILE, LAND_USE_DESIRABILITY_WEIGHTS, ZONING_WEIGHTS } from '../../config/analysis/zoningWeights';

type DeveloperFitInput = {
  areaM2?: number;
  zoningStatus?: string;
  tapuType?: string;
  ada?: string;
  parsel?: string;
  pafta?: string;
  roadAccess?: string;
  electricity?: string;
  water?: string;
};

export type DeveloperFitResult = {
  developerFitScore: number;
  developerFit: 'HIGH' | 'MEDIUM' | 'LOW';
  zoningPotentialScore: number;
  zoningPotential: 'HIGH' | 'MEDIUM' | 'LOW';
  parcelReadinessScore: number;
};

function normalize(value?: string) {
  return (value || '').trim().toLowerCase();
}

function hasNegativeUtility(value?: string) {
  const v = normalize(value);
  return v.includes('no') || v.includes('none') || v.includes('yok');
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function resolveZoningProfile(zoningStatus?: string) {
  const zoning = normalize(zoningStatus);
  const found = Object.entries(ZONING_WEIGHTS).find(([key]) => zoning.includes(key));
  return found ? found[1] : DEFAULT_ZONING_PROFILE;
}

function roadProximityScore(value?: string) {
  const v = normalize(value);
  if (!v) return ROAD_PROXIMITY_SCORES.unknown;
  if (ROAD_PROXIMITY_KEYWORDS.strong.some((k) => v.includes(k))) return ROAD_PROXIMITY_SCORES.strong;
  if (ROAD_PROXIMITY_KEYWORDS.medium.some((k) => v.includes(k))) return ROAD_PROXIMITY_SCORES.medium;
  if (ROAD_PROXIMITY_KEYWORDS.weak.some((k) => v.includes(k))) return ROAD_PROXIMITY_SCORES.weak;
  return ROAD_PROXIMITY_SCORES.unknown;
}

export function calculateDeveloperFit(input: DeveloperFitInput): DeveloperFitResult {
  const zoningProfile = resolveZoningProfile(input.zoningStatus);
  const zoningPotentialScore = zoningProfile.zoningPotentialScore;

  let parcelReadinessScore = 20;
  if (input.ada) parcelReadinessScore += 25;
  if (input.parsel) parcelReadinessScore += 30;
  if (input.pafta) parcelReadinessScore += 10;
  if (input.tapuType && normalize(input.tapuType) !== 'unknown') parcelReadinessScore += 15;

  const roadScore = roadProximityScore(input.roadAccess);
  const electricityScore = hasNegativeUtility(input.electricity)
    ? INFRASTRUCTURE_SCORE_COMPONENTS.baseScore - INFRASTRUCTURE_SCORE_COMPONENTS.missingPenalty
    : INFRASTRUCTURE_SCORE_COMPONENTS.baseScore + INFRASTRUCTURE_SCORE_COMPONENTS.electricityPositive;
  const waterScore = hasNegativeUtility(input.water)
    ? INFRASTRUCTURE_SCORE_COMPONENTS.baseScore - INFRASTRUCTURE_SCORE_COMPONENTS.missingPenalty
    : INFRASTRUCTURE_SCORE_COMPONENTS.baseScore + INFRASTRUCTURE_SCORE_COMPONENTS.waterPositive;

  const infraScore = clamp(
    Math.round(
      roadScore * INFRASTRUCTURE_WEIGHTS.roadAccess +
        electricityScore * INFRASTRUCTURE_WEIGHTS.electricity +
        waterScore * INFRASTRUCTURE_WEIGHTS.water,
    ),
    0,
    100,
  );

  let sizeScore = 40;
  if (typeof input.areaM2 === 'number' && input.areaM2 > 0) {
    if (input.areaM2 >= 250 && input.areaM2 <= 20000) sizeScore = 85;
    else if (input.areaM2 > 20000 && input.areaM2 <= 50000) sizeScore = 65;
    else if (input.areaM2 < 250) sizeScore = 35;
    else sizeScore = 50;
  }

  const landUseDesirabilityScore = clamp(
    Math.round(
      zoningProfile.desirabilityScore * LAND_USE_DESIRABILITY_WEIGHTS.zoningDesirability +
        infraScore * LAND_USE_DESIRABILITY_WEIGHTS.infrastructureSupport +
        sizeScore * LAND_USE_DESIRABILITY_WEIGHTS.parcelSizeFit,
    ),
    0,
    100,
  );

  const developerFitScore = Math.round(
    zoningPotentialScore * 0.35 +
      clamp(parcelReadinessScore, 0, 100) * 0.3 +
      clamp(infraScore, 0, 100) * 0.2 +
      landUseDesirabilityScore * 0.15,
  );

  const developerFit: DeveloperFitResult['developerFit'] =
    developerFitScore >= 75 ? 'HIGH' : developerFitScore >= 55 ? 'MEDIUM' : 'LOW';

  const zoningPotential: DeveloperFitResult['zoningPotential'] =
    zoningPotentialScore >= 75 ? 'HIGH' : zoningPotentialScore >= 50 ? 'MEDIUM' : 'LOW';

  return {
    developerFitScore: clamp(developerFitScore, 0, 100),
    developerFit,
    zoningPotentialScore: clamp(zoningPotentialScore, 0, 100),
    zoningPotential,
    parcelReadinessScore: clamp(parcelReadinessScore, 0, 100),
  };
}
