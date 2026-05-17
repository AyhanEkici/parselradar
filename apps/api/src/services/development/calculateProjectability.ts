import { PROJECTABILITY_THRESHOLDS } from '../../config/development/developerThresholds';

export type ProjectabilityResult = {
  score: number;
  level: 'easy' | 'moderate' | 'difficult';
  blockers: string[];
};

export function calculateProjectability(input: {
  densityScore: number;
  infrastructureScore?: number;
  roadAccessScore?: number;
  frontageDepthScore: number;
  subdivisionScore: number;
  rezoningScore: number;
}): ProjectabilityResult {
  const blockers: string[] = [];
  let score = input.densityScore * 0.24 + (input.infrastructureScore || 0) * 0.18 + (input.roadAccessScore || 0) * 0.16 + input.frontageDepthScore * 0.18 + input.subdivisionScore * 0.12 + input.rezoningScore * 0.12;

  if ((input.infrastructureScore || 0) < 45) blockers.push('infrastructure_constraint');
  if ((input.roadAccessScore || 0) < 45) blockers.push('access_constraint');
  if (input.frontageDepthScore < 48) blockers.push('geometry_constraint');
  if (input.densityScore < 52) blockers.push('density_constraint');

  score -= blockers.length * 4;
  const bounded = Math.max(0, Math.min(100, Math.round(score)));
  const level = bounded >= PROJECTABILITY_THRESHOLDS.easy ? 'easy' : bounded >= PROJECTABILITY_THRESHOLDS.moderate ? 'moderate' : 'difficult';

  return {
    score: bounded,
    level,
    blockers,
  };
}
