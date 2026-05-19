import { IntelligenceSignal } from '../intelligence/intelligenceTypes';

export function settlementExpansionForecast(input: { municipalPressureScore?: number; migrationPressure?: number; infrastructurePressureScore?: number }): IntelligenceSignal<number> {
  const municipal = Number(input.municipalPressureScore || 0);
  const migration = Number(input.migrationPressure || 0);
  const infrastructure = Number(input.infrastructurePressureScore || 0);
  const value = Math.max(0, Math.min(100, Math.round(municipal * 0.4 + migration * 0.3 + infrastructure * 0.3)));
  return {
    value,
    source: 'municipal pressure + migration + infrastructure pressure',
    freshnessDays: 33,
    confidence: 57,
    inferenceLevel: 'inferred',
    notes: ['Expansion forecast indicates pressure, not entitlement approval certainty.'],
  };
}
