import { IntelligenceSignal } from '../intelligence/intelligenceTypes';

export function industrialExpansionAnalyzer(input: { industrialZoneDistanceKm?: number; infrastructurePressureScore?: number; districtHeat?: number }): IntelligenceSignal<number> {
  const zoneDistance = Number.isFinite(input.industrialZoneDistanceKm as number) ? Number(input.industrialZoneDistanceKm) : 60;
  const pressure = Number(input.infrastructurePressureScore || 0);
  const heat = Number(input.districtHeat || 0);
  const proximityScore = Math.max(0, 100 - zoneDistance * 2);
  const value = Math.max(0, Math.min(100, Math.round(proximityScore * 0.45 + pressure * 0.35 + heat * 0.2)));
  return {
    value,
    source: 'industrial proximity + infrastructure pressure + district heat',
    freshnessDays: 40,
    confidence: 55,
    inferenceLevel: 'estimated',
    notes: ['Higher value may indicate industrial expansion relevance; remains probabilistic.'],
  };
}
