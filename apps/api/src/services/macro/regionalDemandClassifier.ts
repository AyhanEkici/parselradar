import { IntelligenceSignal } from '../intelligence/intelligenceTypes';

export function regionalDemandClassifier(input: { marketHeat?: string; comparableCount?: number; regionalDemandScore?: number }): IntelligenceSignal<'LOW' | 'BALANCED' | 'ELEVATED' | 'SURGING'> {
  const heat = String(input.marketHeat || '').toUpperCase();
  const comps = Number(input.comparableCount || 0);
  const demand = Number(input.regionalDemandScore || 0);
  const score = demand + (heat === 'HOT' ? 22 : heat === 'ACTIVE' ? 12 : 0) + Math.min(18, comps / 3);
  const value = score >= 85 ? 'SURGING' : score >= 60 ? 'ELEVATED' : score >= 35 ? 'BALANCED' : 'LOW';
  return {
    value,
    source: 'market heat + comparables + regional demand score',
    freshnessDays: 21,
    confidence: Math.max(25, Math.min(90, 35 + Math.min(40, comps))),
    inferenceLevel: comps >= 8 ? 'inferred' : 'estimated',
    notes: ['Demand class is evidence-weighted and not a guarantee of absorption.'],
  };
}
