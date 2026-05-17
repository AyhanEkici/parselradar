export type SubdivisionPotential = 'low' | 'medium' | 'high';

export function calculateSubdivisionPotential(input: {
  areaM2?: number;
  zoning?: string;
  district?: string;
}): { potential: SubdivisionPotential; score: number; message: string } {
  const areaM2 = input.areaM2 || 0;
  const zoning = (input.zoning || '').toLowerCase();

  if (zoning.includes('tarla') || zoning.includes('agricultural') || zoning.includes('agricultureal')) {
    return {
      potential: 'low',
      score: 25,
      message: 'Agricultural zoning typically prohibits subdivision.',
    };
  }

  if (areaM2 < 1500) {
    return {
      potential: 'low',
      score: 30,
      message: 'Parcel too small for meaningful subdivision.',
    };
  }

  if (areaM2 < 3000) {
    return {
      potential: 'medium',
      score: 55,
      message: 'Medium subdivision potential: can split into 2-3 units.',
    };
  }

  if (areaM2 < 7000) {
    return {
      potential: 'high',
      score: 75,
      message: 'High subdivision potential: can split into 3-5 units.',
    };
  }

  return {
    potential: 'high',
    score: 88,
    message: 'Very high subdivision potential: can support 5+ subdivisions.',
  };
}
