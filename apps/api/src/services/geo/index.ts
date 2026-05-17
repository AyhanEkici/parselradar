import { calculateInfrastructureScore } from './calculateInfrastructureScore';
import { calculateRoadAccessScore } from './calculateRoadAccessScore';
import { calculateUtilityCoverage } from './calculateUtilityCoverage';
import { calculateGrowthPotential } from './calculateGrowthPotential';
import { calculateRegionalDemand } from './calculateRegionalDemand';
import { detectStrategicLocation } from './detectStrategicLocation';

export type GeoIntelligenceOutput = {
  infrastructureScore: number;
  roadAccessScore: number;
  utilityCoverage: {
    electricityScore: number;
    waterScore: number;
    gasScore: number;
    internetScore: number;
    totalScore: number;
  };
  growthPotential: {
    growthScore: number;
    developmentPhase: 'emerging' | 'developing' | 'mature' | 'saturated';
    growthIndicators: number;
  };
  regionalDemand: {
    demandLevel: 'cold' | 'stable' | 'active' | 'high_growth';
    demandScore: number;
  };
  strategicLocationSignals: string[];
  geoSummary: string;
};

export function buildGeoIntelligence(input: {
  city?: string;
  district?: string;
  areaM2?: number;
  zoningStatus?: string;
  roadAccess?: string;
  electricity?: string;
  water?: string;
}): GeoIntelligenceOutput {
  const infrastructure = calculateInfrastructureScore({
    roadAccess: input.roadAccess,
    electricity: input.electricity,
    water: input.water,
    areaM2: input.areaM2,
  });

  const road = calculateRoadAccessScore(input.roadAccess);

  const utilities = calculateUtilityCoverage({
    electricity: input.electricity,
    water: input.water,
  });

  const growth = calculateGrowthPotential(input.city, input.district);

  const demand = calculateRegionalDemand(input.city, input.district, input.zoningStatus);

  const strategic = detectStrategicLocation({
    city: input.city,
    district: input.district,
    areaM2: input.areaM2,
    zoningStatus: input.zoningStatus,
  });

  const summary =
    `Infrastructure readiness: ${infrastructure}. ` +
    `Road access: ${road}. ` +
    `Utility coverage: ${utilities.totalScore}%. ` +
    `Growth phase: ${growth.developmentPhase} with ${growth.growthIndicators}% indicators. ` +
    `Regional demand: ${demand.demandLevel}. ` +
    (strategic.length > 0 ? `Strategic signals: ${strategic.join(', ')}.` : 'No strategic signals detected.');

  return {
    infrastructureScore: infrastructure,
    roadAccessScore: road,
    utilityCoverage: utilities,
    growthPotential: growth,
    regionalDemand: demand,
    strategicLocationSignals: strategic,
    geoSummary: summary,
  };
}

export { calculateInfrastructureScore } from './calculateInfrastructureScore';
export { calculateRoadAccessScore } from './calculateRoadAccessScore';
export { calculateUtilityCoverage } from './calculateUtilityCoverage';
export { calculateGrowthPotential } from './calculateGrowthPotential';
export { calculateRegionalDemand } from './calculateRegionalDemand';
export { detectStrategicLocation } from './detectStrategicLocation';
