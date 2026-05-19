import { IntelligenceSignal } from '../intelligence/intelligenceTypes';

export function imarSignalStrengthEngine(input: { planningLayer?: string; missingInputs?: string[]; sourceConfidence?: string }): IntelligenceSignal<number> {
  const layer = String(input.planningLayer || '1_100000_MACRO_SIGNAL');
  const base =
    layer === '1_1000_OPERATIONAL_SIGNAL'
      ? 82
      : layer === '1_5000_STRONG_SIGNAL'
      ? 66
      : layer === '1_25000_REGIONAL_SIGNAL'
      ? 49
      : 28;
  const missingPenalty = Math.min(36, (input.missingInputs || []).length * 6);
  const sourceAdj = String(input.sourceConfidence || '').toLowerCase() === 'verified' ? 8 : String(input.sourceConfidence || '').toLowerCase() === 'medium' ? 2 : -4;
  const value = Math.max(0, Math.min(100, base - missingPenalty + sourceAdj));
  return {
    value,
    source: 'planning layer + source confidence + missing zoning inputs',
    freshnessDays: 45,
    confidence: Math.max(20, Math.min(90, 30 + Math.round(value * 0.55))),
    inferenceLevel: missingPenalty > 12 ? 'estimated' : 'inferred',
    notes: ['Imar strength is probabilistic and never treated as final approval certainty.'],
  };
}
