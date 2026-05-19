import { IntelligenceSignal } from '../intelligence/intelligenceTypes';

export function populationPressureScorer(input: { migrationPressure?: number; infrastructurePressureScore?: number; liquidityScore?: number }): IntelligenceSignal<number> {
  const migration = Number(input.migrationPressure || 0);
  const infrastructure = Number(input.infrastructurePressureScore || 0);
  const liquidity = Number(input.liquidityScore || 0);
  const value = Math.max(0, Math.min(100, Math.round(migration * 0.45 + infrastructure * 0.35 + liquidity * 0.2)));
  return {
    value,
    source: 'migration + infrastructure + liquidity blend',
    freshnessDays: 33,
    confidence: 59,
    inferenceLevel: 'estimated',
    notes: ['Population pressure score is a regional stress indicator.'],
  };
}
