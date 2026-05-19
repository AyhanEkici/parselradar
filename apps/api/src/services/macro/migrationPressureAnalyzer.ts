import { IntelligenceSignal } from '../intelligence/intelligenceTypes';

export function migrationPressureAnalyzer(input: { regionalDemandScore?: number; districtHeat?: number; staleFlags?: string[] }): IntelligenceSignal<number> {
  const demand = Number(input.regionalDemandScore || 0);
  const heat = Number(input.districtHeat || 0);
  const stalePenalty = (input.staleFlags || []).length * 6;
  const value = Math.max(0, Math.min(100, Math.round(demand * 0.55 + heat * 0.45 - stalePenalty)));
  return {
    value,
    source: 'regional demand + district heat signals',
    freshnessDays: stalePenalty > 0 ? 90 : 30,
    confidence: Math.max(20, Math.min(90, 70 - stalePenalty)),
    inferenceLevel: stalePenalty > 12 ? 'estimated' : 'inferred',
    notes: ['Higher score indicates stronger migration-related demand pressure.'],
  };
}
