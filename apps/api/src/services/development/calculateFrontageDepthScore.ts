import { FRONTAGE_DEPTH_WEIGHTS, FRONTAGE_DEPTH_SCORE_FACTORS } from '../../config/development/frontageDepthWeights';

export type FrontageDepthResult = {
  score: number;
  frontageScore: number;
  depthScore: number;
  isCornerLot: boolean;
  quality: 'excellent' | 'good' | 'adequate' | 'poor';
};

export function calculateFrontageDepthScore(input: {
  frontageM?: number;
  depthM?: number;
  areaM2?: number;
  isCorner?: boolean;
  shapeDescription?: string;
}): FrontageDepthResult {
  const frontageM = input.frontageM || 15;
  const depthM = input.depthM || 30;
  const isCorner = input.isCorner || false;
  const shape = (input.shapeDescription || '').toLowerCase();

  let frontageScore: number = FRONTAGE_DEPTH_WEIGHTS.frontageDesirability.adequate.score;
  if (frontageM >= 30) {
    frontageScore = FRONTAGE_DEPTH_WEIGHTS.frontageDesirability.excellent.score as number;
  } else if (frontageM >= 20) {
    frontageScore = FRONTAGE_DEPTH_WEIGHTS.frontageDesirability.good.score as number;
  } else if (frontageM >= 10) {
    frontageScore = FRONTAGE_DEPTH_WEIGHTS.frontageDesirability.adequate.score as number;
  } else {
    frontageScore = FRONTAGE_DEPTH_WEIGHTS.frontageDesirability.narrow.score as number;
  }

  let depthScore = 70;
  if (depthM <= 15) {
    depthScore = 100 - FRONTAGE_DEPTH_WEIGHTS.depthPenalties.shallowPenalty.penalty;
  } else if (depthM <= 30) {
    depthScore = 100 - FRONTAGE_DEPTH_WEIGHTS.depthPenalties.moderatePenalty.penalty;
  } else if (depthM <= 50) {
    depthScore = 100 - FRONTAGE_DEPTH_WEIGHTS.depthPenalties.deepParcelPenalty.penalty;
  } else {
    depthScore = 100 - FRONTAGE_DEPTH_WEIGHTS.depthPenalties.extremelyDeepPenalty.penalty;
  }

  let cornerBonus = 0;
  if (isCorner) {
    cornerBonus = FRONTAGE_DEPTH_WEIGHTS.cornerBonus;
  }

  let regularityBonus = 0;
  if (shape.includes('rectangular') || shape.includes('regular') || shape.includes('düzgün')) {
    regularityBonus = FRONTAGE_DEPTH_WEIGHTS.rectangularityBonus;
  } else if (shape.includes('irregular') || shape.includes('düzensiz')) {
    regularityBonus = -FRONTAGE_DEPTH_WEIGHTS.irregularShapePenalty;
  }

  const score = Math.round(
    frontageScore * FRONTAGE_DEPTH_SCORE_FACTORS.frontageWeight +
      depthScore * FRONTAGE_DEPTH_SCORE_FACTORS.depthWeight +
      cornerBonus * FRONTAGE_DEPTH_SCORE_FACTORS.cornerWeight +
      regularityBonus * FRONTAGE_DEPTH_SCORE_FACTORS.regularityWeight
  );

  const finalScore = Math.max(0, Math.min(100, score));

  let quality: 'excellent' | 'good' | 'adequate' | 'poor' = 'adequate';
  if (finalScore >= 80) quality = 'excellent';
  else if (finalScore >= 65) quality = 'good';
  else if (finalScore >= 45) quality = 'adequate';
  else quality = 'poor';

  return {
    score: finalScore,
    frontageScore,
    depthScore,
    isCornerLot: isCorner,
    quality,
  };
}
