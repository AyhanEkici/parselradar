import { IntelligenceSignal } from '../intelligence/intelligenceTypes';

export function educationProfileAnalyzer(input: { universityDistanceKm?: number; districtHeat?: number }): IntelligenceSignal<'LOW' | 'MODERATE' | 'HIGH'> {
  const distance = Number.isFinite(input.universityDistanceKm as number) ? Number(input.universityDistanceKm) : 60;
  const heat = Number(input.districtHeat || 0);
  const score = Math.max(0, Math.min(100, Math.round((100 - distance * 1.4) * 0.7 + heat * 0.3)));
  const value = score >= 72 ? 'HIGH' : score >= 44 ? 'MODERATE' : 'LOW';
  return {
    value,
    source: 'university proximity + district heat proxy',
    freshnessDays: 50,
    confidence: 52,
    inferenceLevel: 'estimated',
    notes: ['Education profile is inferred from accessible proximity proxies.'],
  };
}
