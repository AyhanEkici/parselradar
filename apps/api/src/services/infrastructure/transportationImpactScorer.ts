import { IntelligenceSignal } from '../intelligence/intelligenceTypes';

export function transportationImpactScorer(input: { roadAccessScore?: number; airportDistanceKm?: number; corridorDistanceKm?: number }): IntelligenceSignal<number> {
  const road = Number(input.roadAccessScore || 0);
  const airport = Number.isFinite(input.airportDistanceKm as number) ? Number(input.airportDistanceKm) : 40;
  const corridor = Number.isFinite(input.corridorDistanceKm as number) ? Number(input.corridorDistanceKm) : 35;
  const distanceFactor = Math.max(0, 100 - airport * 1.4 - corridor * 1.2);
  const value = Math.max(0, Math.min(100, Math.round(road * 0.6 + distanceFactor * 0.4)));
  return {
    value,
    source: 'road access and transport distance proxies',
    freshnessDays: 34,
    confidence: 58,
    inferenceLevel: 'estimated',
    notes: ['Uses deterministic transport-distance scoring from available signals.'],
  };
}
