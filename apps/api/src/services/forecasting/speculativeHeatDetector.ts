import { IntelligenceSignal } from '../intelligence/intelligenceTypes';

export function speculativeHeatDetector(input: { volatilityIndex?: number; pricePressureScore?: number; unsupportedAssumptionsCount?: number }): IntelligenceSignal<number> {
  const volatility = Number(input.volatilityIndex || 0);
  const pricePressure = Number(input.pricePressureScore || 0);
  const unsupported = Number(input.unsupportedAssumptionsCount || 0);
  const value = Math.max(0, Math.min(100, Math.round(volatility * 0.45 + pricePressure * 0.4 + unsupported * 12)));
  return {
    value,
    source: 'volatility + price pressure + unsupported assumptions',
    freshnessDays: 14,
    confidence: 71,
    inferenceLevel: unsupported > 0 ? 'verified' : 'inferred',
    notes: ['Higher heat implies stronger speculative risk concentration.'],
  };
}
