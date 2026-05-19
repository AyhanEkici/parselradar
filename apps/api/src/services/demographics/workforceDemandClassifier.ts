import { IntelligenceSignal } from '../intelligence/intelligenceTypes';

export function workforceDemandClassifier(input: { industrialExpansionScore?: number; logisticsCorridorScore?: number; publicInvestmentScore?: number }): IntelligenceSignal<'LOW' | 'MODERATE' | 'HIGH'> {
  const industrial = Number(input.industrialExpansionScore || 0);
  const logistics = Number(input.logisticsCorridorScore || 0);
  const investment = Number(input.publicInvestmentScore || 0);
  const score = Math.max(0, Math.min(100, Math.round(industrial * 0.4 + logistics * 0.3 + investment * 0.3)));
  const value = score >= 70 ? 'HIGH' : score >= 45 ? 'MODERATE' : 'LOW';
  return {
    value,
    source: 'industrial + logistics + public investment composite',
    freshnessDays: 35,
    confidence: 60,
    inferenceLevel: 'inferred',
    notes: ['Workforce demand class indicates labor pull potential, not hiring guarantees.'],
  };
}
