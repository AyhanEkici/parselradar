import { DEVELOPMENT_ZONES, DEVELOPMENT_PHASE_SCORES } from '../../config/geo/developmentZones';

export type GrowthPotentialResult = {
  growthScore: number;
  developmentPhase: 'emerging' | 'developing' | 'mature' | 'saturated';
  growthIndicators: number;
};

function normalize(value?: string) {
  return (value || '').trim().toLowerCase();
}

export function calculateGrowthPotential(city?: string, district?: string): GrowthPotentialResult {
  const normalizedCity = normalize(city);
  const normalizedDistrict = normalize(district);

  const zone = DEVELOPMENT_ZONES.find(
    (z) => normalize(z.city) === normalizedCity && (!z.district || normalize(z.district) === normalizedDistrict)
  );

  if (!zone) {
    return {
      growthScore: 55,
      developmentPhase: 'mature',
      growthIndicators: 60,
    };
  }

  const growthScore = DEVELOPMENT_PHASE_SCORES[zone.developmentPhase];

  return {
    growthScore,
    developmentPhase: zone.developmentPhase,
    growthIndicators: zone.growthIndicators,
  };
}
