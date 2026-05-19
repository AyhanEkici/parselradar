import { DevelopmentProbability, IntelligenceSignal } from '../intelligence/intelligenceTypes';

export function developmentProbabilityModel(input: { planningProbability: DevelopmentProbability; strategicRegionScore?: number; speculativeHeat?: number }): IntelligenceSignal<DevelopmentProbability> {
  const planning = input.planningProbability;
  const strategic = Number(input.strategicRegionScore || 0);
  const speculative = Number(input.speculativeHeat || 0);
  const planningScore = planning === 'VERY_HIGH' ? 88 : planning === 'HIGH' ? 72 : planning === 'MODERATE' ? 54 : planning === 'LOW' ? 34 : 18;
  const score = Math.max(0, Math.min(100, Math.round(planningScore * 0.65 + strategic * 0.35 - speculative * 0.2)));
  const value: DevelopmentProbability = score >= 86 ? 'VERY_HIGH' : score >= 69 ? 'HIGH' : score >= 48 ? 'MODERATE' : score >= 30 ? 'LOW' : 'VERY_LOW';
  return {
    value,
    source: 'planning probability baseline + strategic score - speculative heat',
    freshnessDays: 29,
    confidence: Math.max(20, Math.min(90, 30 + Math.round(score * 0.5))),
    inferenceLevel: speculative > 60 ? 'estimated' : 'inferred',
    notes: ['Model decreases probability under high speculative heat and weak strategic context.'],
  };
}
