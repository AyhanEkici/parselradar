import { IntelligenceSignal } from '../intelligence/intelligenceTypes';

export function marketVelocityAnalyzer(input: { trendVelocityScore?: number; liquidityTrendScore?: number; volatilityIndex?: number }): IntelligenceSignal<number> {
  const velocity = Number(input.trendVelocityScore || 0);
  const liquidity = Number(input.liquidityTrendScore || 0);
  const volatility = Number(input.volatilityIndex || 0);
  const value = Math.max(0, Math.min(100, Math.round(velocity * 0.5 + liquidity * 0.35 - volatility * 0.15 + 20)));
  return {
    value,
    source: 'trend velocity + liquidity trend - volatility pressure',
    freshnessDays: 20,
    confidence: 63,
    inferenceLevel: 'inferred',
    notes: ['Velocity score captures relative market speed, not transaction guarantees.'],
  };
}
