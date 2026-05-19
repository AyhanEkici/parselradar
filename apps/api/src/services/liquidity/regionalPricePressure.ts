import { IntelligenceSignal } from '../intelligence/intelligenceTypes';

export function regionalPricePressure(input: { pricingDeltaRatio?: number; overpricingRisk?: string; districtHeat?: number }): IntelligenceSignal<number> {
  const delta = Number(input.pricingDeltaRatio || 0);
  const risk = String(input.overpricingRisk || '').toUpperCase();
  const heat = Number(input.districtHeat || 0);
  const riskWeight = risk === 'HIGH' ? 28 : risk === 'MEDIUM' ? 14 : 6;
  const value = Math.max(0, Math.min(100, Math.round(delta * 100 * 0.45 + riskWeight + heat * 0.35)));
  return {
    value,
    source: 'price delta ratio + overpricing risk + district heat',
    freshnessDays: 24,
    confidence: 61,
    inferenceLevel: 'inferred',
    notes: ['Higher pressure indicates pricing tension and potential correction risk.'],
  };
}
