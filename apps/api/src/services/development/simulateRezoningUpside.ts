import { ZONING_SCENARIO_WEIGHTS, ZONING_UPSIDE_KEYWORDS } from '../../config/development/zoningScenarioWeights';

export type RezoningUpsideResult = {
  score: number;
  scenario: 'stable' | 'moderate_upside' | 'speculative_upside' | 'infrastructure_linked';
  signals: string[];
};

function resolveScenario(zoningStatus?: string) {
  const zoning = (zoningStatus || '').toLowerCase();
  if (ZONING_UPSIDE_KEYWORDS.infrastructure_linked.some((keyword) => zoning.includes(keyword))) return 'infrastructure_linked' as const;
  if (ZONING_UPSIDE_KEYWORDS.speculative_upside.some((keyword) => zoning.includes(keyword))) return 'speculative_upside' as const;
  if (ZONING_UPSIDE_KEYWORDS.moderate_upside.some((keyword) => zoning.includes(keyword))) return 'moderate_upside' as const;
  return 'stable' as const;
}

export function simulateRezoningUpside(input: {
  zoningStatus?: string;
  infrastructureScore?: number;
  roadAccessScore?: number;
  demandScore?: number;
}): RezoningUpsideResult {
  const scenario = resolveScenario(input.zoningStatus);
  const config = ZONING_SCENARIO_WEIGHTS[scenario];
  const score = config.baseScore + (input.infrastructureScore || 0) * config.infraMultiplier + (input.demandScore || 0) * config.demandMultiplier + (input.roadAccessScore || 0) * config.roadMultiplier;
  const signals: string[] = [];

  if ((input.infrastructureScore || 0) >= 70) signals.push('infrastructure_supports_upside');
  if ((input.demandScore || 0) >= 75) signals.push('regional_demand_supports_repositioning');
  if ((input.roadAccessScore || 0) >= 70) signals.push('access_supports_intensification');

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    scenario,
    signals,
  };
}
