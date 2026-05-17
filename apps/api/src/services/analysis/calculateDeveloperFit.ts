type DeveloperFitInput = {
  areaM2?: number;
  zoningStatus?: string;
  tapuType?: string;
  ada?: string;
  parsel?: string;
  pafta?: string;
  roadAccess?: string;
  electricity?: string;
  water?: string;
};

export type DeveloperFitResult = {
  developerFitScore: number;
  developerFit: 'HIGH' | 'MEDIUM' | 'LOW';
  zoningPotentialScore: number;
  zoningPotential: 'HIGH' | 'MEDIUM' | 'LOW';
  parcelReadinessScore: number;
};

function normalize(value?: string) {
  return (value || '').trim().toLowerCase();
}

function hasNegativeUtility(value?: string) {
  const v = normalize(value);
  return v.includes('no') || v.includes('none') || v.includes('yok');
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function calculateDeveloperFit(input: DeveloperFitInput): DeveloperFitResult {
  const zoning = normalize(input.zoningStatus);

  let zoningPotentialScore = 45;
  if (zoning.includes('residential') || zoning.includes('konut')) zoningPotentialScore = 85;
  else if (zoning.includes('commercial') || zoning.includes('ticari') || zoning.includes('mixed')) zoningPotentialScore = 90;
  else if (zoning.includes('agricultural') || zoning.includes('tarim')) zoningPotentialScore = 35;
  else if (zoning.includes('protected') || zoning.includes('sit') || zoning.includes('park')) zoningPotentialScore = 25;

  let parcelReadinessScore = 20;
  if (input.ada) parcelReadinessScore += 25;
  if (input.parsel) parcelReadinessScore += 30;
  if (input.pafta) parcelReadinessScore += 10;
  if (input.tapuType && normalize(input.tapuType) !== 'unknown') parcelReadinessScore += 15;

  let infraScore = 35;
  if (!hasNegativeUtility(input.roadAccess)) infraScore += 20;
  if (!hasNegativeUtility(input.electricity)) infraScore += 20;
  if (!hasNegativeUtility(input.water)) infraScore += 20;

  let sizeScore = 40;
  if (typeof input.areaM2 === 'number' && input.areaM2 > 0) {
    if (input.areaM2 >= 250 && input.areaM2 <= 20000) sizeScore = 85;
    else if (input.areaM2 > 20000 && input.areaM2 <= 50000) sizeScore = 65;
    else if (input.areaM2 < 250) sizeScore = 35;
    else sizeScore = 50;
  }

  const developerFitScore = Math.round(
    zoningPotentialScore * 0.35 +
      clamp(parcelReadinessScore, 0, 100) * 0.3 +
      clamp(infraScore, 0, 100) * 0.2 +
      sizeScore * 0.15,
  );

  const developerFit: DeveloperFitResult['developerFit'] =
    developerFitScore >= 75 ? 'HIGH' : developerFitScore >= 55 ? 'MEDIUM' : 'LOW';

  const zoningPotential: DeveloperFitResult['zoningPotential'] =
    zoningPotentialScore >= 75 ? 'HIGH' : zoningPotentialScore >= 50 ? 'MEDIUM' : 'LOW';

  return {
    developerFitScore: clamp(developerFitScore, 0, 100),
    developerFit,
    zoningPotentialScore: clamp(zoningPotentialScore, 0, 100),
    zoningPotential,
    parcelReadinessScore: clamp(parcelReadinessScore, 0, 100),
  };
}
