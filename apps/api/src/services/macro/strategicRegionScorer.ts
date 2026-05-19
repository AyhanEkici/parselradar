import { IntelligenceSignal } from '../intelligence/intelligenceTypes';

export function strategicRegionScorer(input: { growthDirection?: string; infrastructurePressure?: string; planningProbability?: number; demandClass?: string }): IntelligenceSignal<number> {
  const growth = String(input.growthDirection || 'STABLE');
  const infra = String(input.infrastructurePressure || 'LOW');
  const planning = Number(input.planningProbability || 0);
  const demand = String(input.demandClass || 'BALANCED');
  const growthWeight = growth === 'ACCELERATING' ? 28 : growth === 'DEVELOPING' ? 18 : growth === 'DECLINING' ? -12 : 8;
  const infraWeight = infra === 'STRATEGIC' ? 24 : infra === 'STRONG' ? 16 : infra === 'MODERATE' ? 8 : 2;
  const demandWeight = demand === 'SURGING' ? 20 : demand === 'ELEVATED' ? 12 : demand === 'LOW' ? -10 : 5;
  const value = Math.max(0, Math.min(100, Math.round(35 + growthWeight + infraWeight + demandWeight + planning * 0.12)));
  return {
    value,
    source: 'macro growth + infrastructure + planning + demand classes',
    freshnessDays: 28,
    confidence: 68,
    inferenceLevel: 'inferred',
    notes: ['Strategic score ranks territorial positioning; not an investment guarantee.'],
  };
}
