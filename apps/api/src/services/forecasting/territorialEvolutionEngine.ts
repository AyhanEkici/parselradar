import { IntelligenceSignal, RegionalOutlook } from '../intelligence/intelligenceTypes';

export function territorialEvolutionEngine(input: { regionalGrowth: RegionalOutlook; planningProbability?: string; infrastructurePressure?: string; demographicTrend?: string }): IntelligenceSignal<RegionalOutlook> {
  const growth = input.regionalGrowth;
  const planning = String(input.planningProbability || 'LOW');
  const infra = String(input.infrastructurePressure || 'LOW');
  const demographic = String(input.demographicTrend || 'STABLE');

  let value: RegionalOutlook = growth;
  if ((growth === 'STABLE' || growth === 'DEVELOPING') && planning === 'HIGH' && (infra === 'STRONG' || infra === 'STRATEGIC')) {
    value = 'ACCELERATING';
  }
  if (growth === 'DEVELOPING' && demographic === 'CONTRACTING') {
    value = 'STABLE';
  }

  return {
    value,
    source: 'growth + planning + infrastructure + demographic trend synthesis',
    freshnessDays: 30,
    confidence: 62,
    inferenceLevel: 'inferred',
    notes: ['Territorial evolution is scenario-based and should be reviewed with fresh evidence.'],
  };
}
