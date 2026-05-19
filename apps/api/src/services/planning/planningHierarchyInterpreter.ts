import { IntelligenceSignal, PlanningClassification } from '../intelligence/intelligenceTypes';

export function planningHierarchyInterpreter(input: { zoningPotential?: string; municipalSignals?: number; missingInputs?: string[] }): IntelligenceSignal<PlanningClassification> {
  const missingZoning = (input.missingInputs || []).some((x) => x.toLowerCase().includes('zoning'));
  const signalCount = Number(input.municipalSignals || 0);
  const z = String(input.zoningPotential || '').toUpperCase();
  const value: PlanningClassification = missingZoning
    ? '1_100000_MACRO_SIGNAL'
    : signalCount >= 6 || z === 'HIGH'
    ? '1_1000_OPERATIONAL_SIGNAL'
    : signalCount >= 4
    ? '1_5000_STRONG_SIGNAL'
    : signalCount >= 2
    ? '1_25000_REGIONAL_SIGNAL'
    : '1_100000_MACRO_SIGNAL';
  return {
    value,
    source: 'zoning potential + municipal signal density',
    freshnessDays: missingZoning ? 120 : 40,
    confidence: missingZoning ? 28 : 62,
    inferenceLevel: missingZoning ? 'unavailable' : signalCount >= 4 ? 'inferred' : 'estimated',
    notes: ['Planning layer reflects available hierarchy evidence, not permit certainty.'],
  };
}
