export type ProjectabilityLevel = 'easy' | 'moderate' | 'difficult';

export type ProjectabilityResult = {
  level: ProjectabilityLevel;
  score: number;
  constraints: string[];
  recommendations: string[];
};

export function calculateProjectability(input: {
  areaM2?: number;
  zoning?: string;
  roadAccessScore?: number;
  infrastructureScore?: number;
  densityPotential?: string;
  frontageDepthScore?: number;
}): ProjectabilityResult {
  const constraints: string[] = [];
  const recommendations: string[] = [];
  let score = 70;

  const areaM2 = input.areaM2 || 0;
  const roadScore = input.roadAccessScore || 50;
  const infraScore = input.infrastructureScore || 50;
  const frontageScore = input.frontageDepthScore || 50;
  const normalizedZoning = (input.zoning || '').toLowerCase();

  if (areaM2 < 1000) {
    constraints.push('Small parcel size limits development options');
    score -= 15;
  }

  if (roadScore < 50) {
    constraints.push('Poor road access increases development costs');
    score -= 20;
    recommendations.push('Consider investing in road access improvements');
  }

  if (infraScore < 40) {
    constraints.push('Limited infrastructure availability');
    score -= 15;
    recommendations.push('Evaluate utility extension feasibility');
  }

  if (frontageScore < 45) {
    constraints.push('Challenging parcel geometry');
    score -= 10;
    recommendations.push('Consider geometric constraints in design');
  }

  if (normalizedZoning.includes('tarla') || normalizedZoning.includes('agricultural')) {
    constraints.push('Agricultural zoning requires rezoning approval');
    score -= 25;
    recommendations.push('Initiate rezoning study and municipal negotiations');
  }

  const finalScore = Math.max(0, Math.min(100, score));

  let level: ProjectabilityLevel = 'moderate';
  if (finalScore >= 75) {
    level = 'easy';
  } else if (finalScore <= 50) {
    level = 'difficult';
  }

  return {
    level,
    score: finalScore,
    constraints,
    recommendations,
  };
}
