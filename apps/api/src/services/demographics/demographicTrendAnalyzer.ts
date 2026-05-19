import { IntelligenceSignal } from '../intelligence/intelligenceTypes';

export function demographicTrendAnalyzer(input: { migrationPressure?: number; demandClass?: string; staleFlags?: string[] }): IntelligenceSignal<'CONTRACTING' | 'STABLE' | 'GROWING'> {
  const migration = Number(input.migrationPressure || 0);
  const demand = String(input.demandClass || 'BALANCED');
  const stalePenalty = (input.staleFlags || []).length * 5;
  const score = migration + (demand === 'SURGING' ? 20 : demand === 'ELEVATED' ? 10 : demand === 'LOW' ? -10 : 0) - stalePenalty;
  const value = score >= 75 ? 'GROWING' : score >= 45 ? 'STABLE' : 'CONTRACTING';
  return {
    value,
    source: 'migration pressure + demand class + stale penalty',
    freshnessDays: stalePenalty > 0 ? 90 : 25,
    confidence: Math.max(25, Math.min(86, 62 - stalePenalty)),
    inferenceLevel: stalePenalty > 10 ? 'estimated' : 'inferred',
    notes: ['Demographic direction is evidence-weighted and non-deterministic for outcomes.'],
  };
}
