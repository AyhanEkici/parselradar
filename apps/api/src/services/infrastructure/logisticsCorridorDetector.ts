import { IntelligenceSignal } from '../intelligence/intelligenceTypes';

export function logisticsCorridorDetector(input: { roadCorridorDistanceKm?: number; transportImpactScore?: number }): IntelligenceSignal<number> {
  const distance = Number.isFinite(input.roadCorridorDistanceKm as number) ? Number(input.roadCorridorDistanceKm) : 50;
  const transport = Number(input.transportImpactScore || 0);
  const base = Math.max(0, 100 - distance * 1.8);
  const value = Math.max(0, Math.min(100, Math.round(base * 0.65 + transport * 0.35)));
  return {
    value,
    source: 'road corridor proximity + transportation impact score',
    freshnessDays: 32,
    confidence: 57,
    inferenceLevel: distance <= 18 ? 'inferred' : 'estimated',
    notes: ['Detects corridor influence based on available distance proxies.'],
  };
}
