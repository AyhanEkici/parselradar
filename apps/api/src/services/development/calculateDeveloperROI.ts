import { DEVELOPER_ROI_THRESHOLDS, ROI_SCORE_FACTORS } from '../../config/development/developerThresholds';

export type DeveloperROITier = 'conservative' | 'moderate' | 'aggressive';

export function calculateDeveloperROI(input: {
  areaM2?: number;
  densityScore?: number;
  marketHeat?: string;
  infrastructureScore?: number;
  rezoningPotential?: number;
  projectabilityScore?: number;
}): { tier: DeveloperROITier; score: number; description: string } {
  const areaM2 = input.areaM2 || 0;
  const densityScore = input.densityScore || 50;
  const infraScore = input.infrastructureScore || 55;
  const rezoningScore = input.rezoningPotential || 50;
  const projectScore = input.projectabilityScore || 60;

  let marketHeatScore = 60;
  const normalizedHeat = (input.marketHeat || '').toLowerCase();
  if (normalizedHeat.includes('cold')) marketHeatScore = 30;
  else if (normalizedHeat.includes('stable')) marketHeatScore = 55;
  else if (normalizedHeat.includes('active')) marketHeatScore = 80;
  else if (normalizedHeat.includes('hot')) marketHeatScore = 95;

  const sizeBonus = areaM2 >= 3000 ? ROI_SCORE_FACTORS.parcelSizeBonus : 0;

  const score = Math.round(
    densityScore * ROI_SCORE_FACTORS.densityPotentialWeight +
      marketHeatScore * ROI_SCORE_FACTORS.marketHeatWeight +
      infraScore * ROI_SCORE_FACTORS.infraReadinessWeight +
      rezoningScore * ROI_SCORE_FACTORS.rezoningUpsideWeight +
      projectScore * ROI_SCORE_FACTORS.projectabilityWeight +
      sizeBonus
  );

  const finalScore = Math.max(0, Math.min(100, score));

  let tier: DeveloperROITier = 'moderate';
  let description: string = DEVELOPER_ROI_THRESHOLDS.moderate.description;

  if (finalScore >= DEVELOPER_ROI_THRESHOLDS.aggressive.minScore) {
    tier = 'aggressive';
    description = DEVELOPER_ROI_THRESHOLDS.aggressive.description as string;
  } else if (finalScore >= DEVELOPER_ROI_THRESHOLDS.conservative.minScore) {
    tier = 'moderate';
    description = DEVELOPER_ROI_THRESHOLDS.moderate.description as string;
  } else {
    tier = 'conservative';
    description = DEVELOPER_ROI_THRESHOLDS.conservative.description as string;
  }

  return { tier, score: finalScore, description };
}
