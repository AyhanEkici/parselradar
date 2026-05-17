import { DEVELOPER_ROI_THRESHOLDS } from '../../config/development/developerThresholds';

export type DeveloperROIResult = {
  score: number;
  scenario: 'conservative' | 'moderate' | 'aggressive';
  roiSignals: string[];
};

export function calculateDeveloperROI(input: {
  densityScore: number;
  demandScore?: number;
  infrastructureScore?: number;
  pricingDeltaRatio?: number;
  frontageDepthScore: number;
}): DeveloperROIResult {
  const signals: string[] = [];
  let score = input.densityScore * 0.34 + (input.demandScore || 55) * 0.18 + (input.infrastructureScore || 55) * 0.18 + input.frontageDepthScore * 0.12;

  const pricingDeltaRatio = input.pricingDeltaRatio || 0;
  if (pricingDeltaRatio <= -0.08) {
    score += 12;
    signals.push('below_market_entry');
  } else if (pricingDeltaRatio >= 0.12) {
    score -= 10;
    signals.push('priced_above_comparables');
  }

  if ((input.infrastructureScore || 0) >= 70) {
    signals.push('infrastructure_support');
  }
  if ((input.demandScore || 0) >= 75) {
    signals.push('regional_absorption_support');
  }

  const rounded = Math.max(0, Math.min(100, Math.round(score)));
  const scenario = rounded >= DEVELOPER_ROI_THRESHOLDS.aggressive ? 'aggressive' : rounded >= DEVELOPER_ROI_THRESHOLDS.moderate ? 'moderate' : 'conservative';

  return {
    score: rounded,
    scenario,
    roiSignals: signals,
  };
}
