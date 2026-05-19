import { IntelligenceSignal } from '../intelligence/intelligenceTypes';

export function municipalExpansionPressure(input: { strategicLocationSignals?: string[]; infrastructureScore?: number; regionalDemandScore?: number }): IntelligenceSignal<number> {
  const strategic = input.strategicLocationSignals || [];
  const infra = Number(input.infrastructureScore || 0);
  const demand = Number(input.regionalDemandScore || 0);
  const value = Math.max(0, Math.min(100, Math.round(strategic.length * 8 + infra * 0.45 + demand * 0.35)));
  return {
    value,
    source: 'strategic location indicators + infrastructure + demand pressure',
    freshnessDays: 30,
    confidence: Math.max(22, Math.min(88, 40 + strategic.length * 6)),
    inferenceLevel: strategic.length >= 3 ? 'inferred' : 'estimated',
    notes: ['Higher pressure can indicate municipal expansion attention, not guaranteed rezoning.'],
  };
}
