import { IntelligenceSignal, LiquidityClassification } from '../intelligence/intelligenceTypes';

export function liquidityScoreEngine(input: { marketMomentum?: number; comparableCount?: number; freshnessScore?: number }): IntelligenceSignal<LiquidityClassification> {
  const momentum = Number(input.marketMomentum || 0);
  const comparables = Number(input.comparableCount || 0);
  const freshness = Number(input.freshnessScore || 0);
  const score = Math.max(0, Math.min(100, Math.round(momentum * 0.45 + Math.min(28, comparables * 3.5) + freshness * 0.27)));
  const value: LiquidityClassification =
    score >= 82 ? 'HIGH_ACTIVITY' : score >= 60 ? 'ACTIVE' : score >= 38 ? 'SLOW' : 'ILLIQUID';
  return {
    value,
    source: 'momentum + comparables + freshness score',
    freshnessDays: Math.max(1, Math.round((100 - freshness) / 4) || 40),
    confidence: Math.max(28, Math.min(90, 40 + comparables * 3)),
    inferenceLevel: comparables >= 8 ? 'inferred' : 'estimated',
    notes: ['ACTIVE/HIGH_ACTIVITY appears only when supporting evidence is sufficient.'],
  };
}
