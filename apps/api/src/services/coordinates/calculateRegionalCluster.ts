import { MUNICIPALITY_CENTERS } from '../../config/maps/municipalityCenters';
import { ROAD_CORRIDORS } from '../../config/maps/roadCorridors';
import { calculateDistanceToInfrastructure, type CoordinatePoint } from './calculateDistanceToInfrastructure';

function normalize(value?: string) {
  return (value || '').trim().toLowerCase();
}

export type RegionalClusterResult = {
  municipality?: {
    city: string;
    district?: string;
    distanceKm: number;
  };
  roadCluster?: {
    name: string;
    distanceKm: number;
  };
  clusterLabel: string;
};

export function calculateRegionalCluster(coordinates: CoordinatePoint, city?: string, district?: string): RegionalClusterResult {
  const normalizedCity = normalize(city);
  const normalizedDistrict = normalize(district);

  const nearestMunicipality = MUNICIPALITY_CENTERS
    .filter((item) => !normalizedCity || normalize(item.city) === normalizedCity)
    .map((item) => ({
      ...item,
      distanceKm: calculateDistanceToInfrastructure(coordinates, item),
    }))
    .sort((left, right) => left.distanceKm - right.distanceKm)[0];

  const nearestRoad = ROAD_CORRIDORS
    .filter((item) => !normalizedCity || normalize(item.city) === normalizedCity)
    .map((item) => ({
      ...item,
      distanceKm: calculateDistanceToInfrastructure(coordinates, item),
    }))
    .sort((left, right) => left.distanceKm - right.distanceKm)[0];

  const clusterLabel = normalizedDistrict
    ? `${normalizedDistrict}_cluster`
    : nearestMunicipality?.city
      ? `${nearestMunicipality.city}_cluster`
      : 'regional_cluster';

  return {
    municipality: nearestMunicipality
      ? {
          city: nearestMunicipality.city,
          district: nearestMunicipality.district,
          distanceKm: nearestMunicipality.distanceKm,
        }
      : undefined,
    roadCluster: nearestRoad
      ? {
          name: nearestRoad.name,
          distanceKm: nearestRoad.distanceKm,
        }
      : undefined,
    clusterLabel,
  };
}
