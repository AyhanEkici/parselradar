import { IntelligenceSignal } from '../intelligence/intelligenceTypes';

export function ageDistributionEngine(input: { investorSignal?: string; marketMomentum?: number }): IntelligenceSignal<'YOUNG_ADULT_HEAVY' | 'BALANCED' | 'MATURE_HEAVY'> {
  const signal = String(input.investorSignal || '').toLowerCase();
  const momentum = Number(input.marketMomentum || 0);
  let value: 'YOUNG_ADULT_HEAVY' | 'BALANCED' | 'MATURE_HEAVY' = 'BALANCED';
  if (signal.includes('growth') || momentum >= 70) value = 'YOUNG_ADULT_HEAVY';
  if (signal.includes('defensive') || momentum <= 35) value = 'MATURE_HEAVY';
  return {
    value,
    source: 'investor signal + momentum proxy',
    freshnessDays: 42,
    confidence: 46,
    inferenceLevel: 'estimated',
    notes: ['Age distribution is inferred from market behavior proxies, not census records.'],
  };
}
