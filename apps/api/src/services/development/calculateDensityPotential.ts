import { DEFAULT_DENSITY_RULE, DENSITY_RULES, DensityCategory } from '../../config/development/densityRules';

export type DensityPotentialResult = {
  category: DensityCategory;
  score: number;
  supportingSignals: string[];
};

export function calculateDensityPotential(input: {
  zoningStatus?: string;
  areaM2?: number;
}): DensityPotentialResult {
  const zoning = (input.zoningStatus || '').toLowerCase();
  const area = input.areaM2 || 0;
  const rule = DENSITY_RULES.find((candidate) => candidate.zoningKeywords.some((keyword) => zoning.includes(keyword))) || DEFAULT_DENSITY_RULE;
  const signals: string[] = [];

  let score = rule.baseScore;
  if (area >= rule.minimumAreaM2) {
    const areaBonus = Math.min(rule.maxAreaBonus, Math.floor((area - rule.minimumAreaM2) / rule.areaScalingStepM2) * 4 + 4);
    score += Math.max(0, areaBonus);
    signals.push('site_area_supports_density');
  } else {
    score -= 8;
    signals.push('site_area_limits_density');
  }

  return {
    category: rule.category,
    score: Math.max(0, Math.min(100, Math.round(score))),
    supportingSignals: signals,
  };
}
