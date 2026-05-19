import { IntelligenceSignal } from '../intelligence/intelligenceTypes';

export function publicInvestmentSignalEngine(input: { strategicSignals?: string[]; infrastructurePressure?: string; municipalPressureScore?: number }): IntelligenceSignal<number> {
  const strategic = input.strategicSignals || [];
  const infra = String(input.infrastructurePressure || 'LOW');
  const municipal = Number(input.municipalPressureScore || 0);
  const infraWeight = infra === 'STRATEGIC' ? 24 : infra === 'STRONG' ? 16 : infra === 'MODERATE' ? 10 : 4;
  const value = Math.max(0, Math.min(100, Math.round(strategic.length * 9 + infraWeight + municipal * 0.45)));
  return {
    value,
    source: 'strategic indicators + infrastructure pressure + municipal pressure',
    freshnessDays: 36,
    confidence: 60,
    inferenceLevel: strategic.length >= 3 ? 'inferred' : 'estimated',
    notes: ['Public investment signal is directional and does not imply awarded projects.'],
  };
}
