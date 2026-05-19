import { IntelligenceSignal } from '../intelligence/intelligenceTypes';

export function developerInterestScorer(input: { developerFit?: string; planningProbability?: string; strategicRegionScore?: number }): IntelligenceSignal<number> {
  const fit = String(input.developerFit || '').toUpperCase();
  const planning = String(input.planningProbability || 'LOW');
  const strategic = Number(input.strategicRegionScore || 0);
  const fitWeight = fit === 'HIGH' ? 30 : fit === 'MEDIUM' ? 18 : 8;
  const planningWeight = planning === 'VERY_HIGH' ? 26 : planning === 'HIGH' ? 18 : planning === 'MODERATE' ? 10 : 2;
  const value = Math.max(0, Math.min(100, Math.round(fitWeight + planningWeight + strategic * 0.45)));
  return {
    value,
    source: 'developer fit + planning probability + strategic region score',
    freshnessDays: 28,
    confidence: 64,
    inferenceLevel: 'inferred',
    notes: ['Developer interest is a scoring proxy and not market commitment evidence.'],
  };
}
