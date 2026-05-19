import { IntelligenceSignal } from '../intelligence/intelligenceTypes';

export function macroEconomicPressureEngine(input: { volatilityIndex?: number; liquidityScore?: number; inflationProxy?: number }): IntelligenceSignal<number> {
  const volatility = Number(input.volatilityIndex || 0);
  const liquidity = Number(input.liquidityScore || 0);
  const inflation = Number(input.inflationProxy || 50);
  const value = Math.max(0, Math.min(100, Math.round(volatility * 0.5 + inflation * 0.35 + (100 - liquidity) * 0.15)));
  return {
    value,
    source: 'volatility + liquidity + macro proxy composite',
    freshnessDays: 30,
    confidence: 62,
    inferenceLevel: 'estimated',
    notes: ['Higher pressure score signals tighter macro conditions and fragility.'],
  };
}
