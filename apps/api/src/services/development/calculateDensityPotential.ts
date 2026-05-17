import { DENSITY_RULES, DENSITY_POTENTIAL_SCORES } from '../../config/development/densityRules';

export type DensityClassification = 'low_rise' | 'mid_rise' | 'high_rise' | 'mixed_use' | 'industrial' | 'tourism';

function normalize(value?: string) {
  return (value || '').trim().toLowerCase();
}

export function calculateDensityPotential(input: {
  areaM2?: number;
  zoning?: string;
  city?: string;
}): { classification: DensityClassification; score: number } {
  const normalizedZoning = normalize(input.zoning);
  const areaM2 = input.areaM2 || 0;

  if (normalizedZoning.includes('sanayi') || normalizedZoning.includes('industrial')) {
    return { classification: 'industrial', score: DENSITY_POTENTIAL_SCORES.industrial };
  }

  if (normalizedZoning.includes('tourism') || normalizedZoning.includes('turizm')) {
    return { classification: 'tourism', score: DENSITY_POTENTIAL_SCORES.tourism };
  }

  if (normalizedZoning.includes('mixed') || normalizedZoning.includes('mixed_use') || normalizedZoning.includes('karışık')) {
    return { classification: 'mixed_use', score: DENSITY_POTENTIAL_SCORES.mixed_use };
  }

  if (normalizedZoning.includes('ticari') || normalizedZoning.includes('commercial')) {
    return { classification: 'high_rise', score: DENSITY_POTENTIAL_SCORES.high_rise };
  }

  if (normalizedZoning.includes('konut') || normalizedZoning.includes('residential')) {
    if (areaM2 >= DENSITY_RULES.high_rise.minParcelM2) {
      return { classification: 'high_rise', score: DENSITY_POTENTIAL_SCORES.high_rise };
    }
    if (areaM2 >= DENSITY_RULES.mid_rise.minParcelM2) {
      return { classification: 'mid_rise', score: DENSITY_POTENTIAL_SCORES.mid_rise };
    }
    return { classification: 'low_rise', score: DENSITY_POTENTIAL_SCORES.low_rise };
  }

  return { classification: 'low_rise', score: DENSITY_POTENTIAL_SCORES.low_rise };
}
