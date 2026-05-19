import { IntelligenceSignal, RegionalOutlook } from '../intelligence/intelligenceTypes';

export function longTermRegionalOutlook(input: { territorialEvolution: RegionalOutlook; demographicTrend?: string; macroPressure?: number }): IntelligenceSignal<RegionalOutlook> {
  const evolution = input.territorialEvolution;
  const demographic = String(input.demographicTrend || 'STABLE');
  const pressure = Number(input.macroPressure || 50);
  let value: RegionalOutlook = evolution;

  if (evolution === 'ACCELERATING' && pressure > 70) value = 'DEVELOPING';
  if (evolution === 'DEVELOPING' && demographic === 'CONTRACTING') value = 'STABLE';
  if (evolution === 'STABLE' && demographic === 'GROWING' && pressure < 55) value = 'DEVELOPING';

  return {
    value,
    source: 'territorial evolution + demographic trend + macro pressure',
    freshnessDays: 45,
    confidence: 60,
    inferenceLevel: 'inferred',
    notes: ['Long-term outlook is adaptive and intentionally conservative under pressure.'],
  };
}
