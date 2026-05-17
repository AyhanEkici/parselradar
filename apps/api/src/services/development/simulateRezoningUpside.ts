import { ZONING_SCENARIO_WEIGHTS, REZONING_DISTRICT_SIGNALS } from '../../config/development/zoningScenarioWeights';

export type RezoningScenario = 'stable' | 'moderate_upside' | 'speculative_upside' | 'infrastructure_linked';

export type RezoningUpsideResult = {
  scenario: RezoningScenario;
  score: number;
  multiplier: number;
  probability: number;
  message: string;
};

function normalize(value?: string) {
  return (value || '').trim().toLowerCase();
}

export function simulateRezoningUpside(input: {
  city?: string;
  district?: string;
  growthPhase?: 'emerging' | 'developing' | 'mature' | 'saturated';
  infraScore?: number;
}): RezoningUpsideResult {
  const normalizedDistrict = normalize(input.district);
  const growthPhase = input.growthPhase || 'stable';
  const infraScore = input.infraScore || 55;

  let baseScenario: RezoningScenario = 'stable';
  let score = 45;

  if (growthPhase === 'emerging') {
    baseScenario = 'speculative_upside';
    score = 82;
  } else if (growthPhase === 'developing') {
    baseScenario = 'moderate_upside';
    score = 68;
  } else if (growthPhase === 'mature') {
    baseScenario = 'stable';
    score = 48;
  }

  if (infraScore >= 85 && (growthPhase === 'developing' || growthPhase === 'emerging')) {
    baseScenario = 'infrastructure_linked';
    score = 75;
  }

  const weights = ZONING_SCENARIO_WEIGHTS[baseScenario];
  const multiplier = weights.weight;
  const probability = weights.upholdProbability;

  return {
    scenario: baseScenario,
    score: Math.min(100, score),
    multiplier,
    probability,
    message: `${weights.label}. ${weights.description}`,
  };
}
