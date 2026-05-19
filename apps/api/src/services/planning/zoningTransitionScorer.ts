import { IntelligenceSignal } from '../intelligence/intelligenceTypes';

export function zoningTransitionScorer(input: { zoningPotential?: string; developmentSignals?: string[]; missingInputs?: string[] }): IntelligenceSignal<number> {
  const z = String(input.zoningPotential || '').toUpperCase();
  const devSignals = input.developmentSignals || [];
  const missingZoning = (input.missingInputs || []).some((x) => x.toLowerCase().includes('zoning'));
  const base = z === 'HIGH' ? 72 : z === 'MEDIUM' ? 54 : z === 'LOW' ? 34 : 22;
  const signalBoost = Math.min(22, devSignals.length * 4);
  const penalty = missingZoning ? 24 : 0;
  const value = Math.max(0, Math.min(100, base + signalBoost - penalty));
  return {
    value,
    source: 'zoning potential + development signal density',
    freshnessDays: missingZoning ? 150 : 30,
    confidence: missingZoning ? 25 : 64,
    inferenceLevel: missingZoning ? 'unavailable' : 'inferred',
    notes: ['Transition score decreases when zoning evidence is incomplete.'],
  };
}
