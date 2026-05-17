export type SpatialOpportunityResult = {
  signals: string[];
};

export function detectSpatialOpportunity(input: {
  infrastructureDistances: {
    airport?: number;
    industrial_zone?: number;
    university?: number;
    hospital?: number;
    road_corridor?: number;
    tourism_zone?: number;
  };
  clusterStrength: number;
  zoningStatus?: string;
}): SpatialOpportunityResult {
  const zoning = (input.zoningStatus || '').toLowerCase();
  const signals: string[] = [];

  if ((input.infrastructureDistances.road_corridor ?? 999) <= 6 && (input.infrastructureDistances.industrial_zone ?? 999) <= 12) {
    signals.push('logistics_corridor');
  }
  if ((input.infrastructureDistances.tourism_zone ?? 999) <= 10) {
    signals.push('tourism_expansion');
  }
  if ((input.infrastructureDistances.industrial_zone ?? 999) <= 10 && (zoning.includes('sanayi') || zoning.includes('industrial'))) {
    signals.push('industrial_growth');
  }
  if ((input.infrastructureDistances.hospital ?? 999) <= 8 && (input.infrastructureDistances.university ?? 999) <= 8) {
    signals.push('suburban_expansion');
  }
  if (input.clusterStrength < 35 && (zoning.includes('konut') || zoning.includes('arsa'))) {
    signals.push('low_density_upside');
  }

  return { signals };
}
