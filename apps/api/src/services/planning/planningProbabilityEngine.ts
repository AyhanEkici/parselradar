import { DevelopmentProbability, IntelligenceSignal, PlanningClassification } from '../intelligence/intelligenceTypes';

export function planningProbabilityEngine(input: {
  planningLayer: PlanningClassification;
  zoningTransitionScore?: number;
  municipalExpansionPressure?: number;
  unsupportedClaims?: number;
}): IntelligenceSignal<DevelopmentProbability> {
  const layerWeight =
    input.planningLayer === '1_1000_OPERATIONAL_SIGNAL'
      ? 78
      : input.planningLayer === '1_5000_STRONG_SIGNAL'
      ? 63
      : input.planningLayer === '1_25000_REGIONAL_SIGNAL'
      ? 47
      : 29;
  const transition = Number(input.zoningTransitionScore || 0);
  const municipal = Number(input.municipalExpansionPressure || 0);
  const claimsPenalty = Number(input.unsupportedClaims || 0) * 14;
  const score = Math.max(0, Math.min(100, Math.round(layerWeight * 0.55 + transition * 0.25 + municipal * 0.2 - claimsPenalty)));
  const value: DevelopmentProbability =
    score >= 85 ? 'VERY_HIGH' : score >= 70 ? 'HIGH' : score >= 50 ? 'MODERATE' : score >= 30 ? 'LOW' : 'VERY_LOW';
  return {
    value,
    source: 'planning layer + transition score + municipal expansion pressure',
    freshnessDays: 35,
    confidence: Math.max(20, Math.min(92, 35 + Math.round(score * 0.45))),
    inferenceLevel: claimsPenalty > 0 ? 'estimated' : 'inferred',
    notes: ['Probability is scenario-based and explicitly non-guaranteed.'],
  };
}
