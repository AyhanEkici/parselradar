import { REGIONAL_DEMAND_MATRIX, DEMAND_LEVEL_SCORES } from '../../config/geo/regionalDemandMatrix';

export type RegionalDemandResult = {
  demandLevel: 'cold' | 'stable' | 'active' | 'high_growth';
  demandScore: number;
  residentialDemand?: number;
  commercialDemand?: number;
  industrialDemand?: number;
};

function normalize(value?: string) {
  return (value || '').trim().toLowerCase();
}

export function calculateRegionalDemand(city?: string, district?: string, zoning?: string): RegionalDemandResult {
  const normalizedCity = normalize(city);
  const normalizedDistrict = normalize(district);
  const normalizedZoning = normalize(zoning);

  let match = REGIONAL_DEMAND_MATRIX.find(
    (entry) => normalize(entry.city) === normalizedCity && (!entry.district || normalize(entry.district) === normalizedDistrict)
  );

  if (!match) {
    match = REGIONAL_DEMAND_MATRIX.find((entry) => normalize(entry.city) === normalizedCity);
  }

  if (!match) {
    return { demandLevel: 'stable', demandScore: 60 };
  }

  let demandScore: number = DEMAND_LEVEL_SCORES[match.demandLevel] as number;

  if (normalizedZoning.includes('konut') || normalizedZoning.includes('residential')) {
    demandScore = Math.round(demandScore * 0.9 + (match.residentialDemand || 0) * 0.1);
  } else if (normalizedZoning.includes('ticari') || normalizedZoning.includes('commercial')) {
    demandScore = Math.round(demandScore * 0.9 + (match.commercialDemand || 0) * 0.1);
  } else if (normalizedZoning.includes('sanayi') || normalizedZoning.includes('industrial')) {
    demandScore = Math.round(demandScore * 0.9 + (match.industrialDemand || 0) * 0.1);
  }

  return {
    demandLevel: match.demandLevel,
    demandScore,
    residentialDemand: match.residentialDemand,
    commercialDemand: match.commercialDemand,
    industrialDemand: match.industrialDemand,
  };
}
