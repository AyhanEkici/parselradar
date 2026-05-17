import { calculateRoadAccessScore } from './calculateRoadAccessScore';
import { calculateUtilityCoverage } from './calculateUtilityCoverage';

export function calculateInfrastructureScore(input: {
  roadAccess?: string;
  electricity?: string;
  water?: string;
  areaM2?: number;
}): number {
  const roadScore = calculateRoadAccessScore(input.roadAccess);

  const utilities = calculateUtilityCoverage({
    electricity: input.electricity,
    water: input.water,
  });

  const areaBonus = typeof input.areaM2 === 'number' && input.areaM2 >= 1000 ? 8 : 0;

  const score = Math.round(roadScore * 0.4 + utilities.totalScore * 0.45 + areaBonus * 0.15);

  return Math.max(0, Math.min(100, score));
}
