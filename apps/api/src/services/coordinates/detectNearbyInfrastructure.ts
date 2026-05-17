import { AIRPORT_NODES } from '../../config/maps/airportNodes';
import { INDUSTRIAL_ZONES } from '../../config/maps/industrialZones';
import { INFRASTRUCTURE_NODES } from '../../config/maps/infrastructureNodes';
import { ROAD_CORRIDORS } from '../../config/maps/roadCorridors';
import { TOURISM_ZONES } from '../../config/maps/tourismZones';
import { calculateDistanceToInfrastructure, type CoordinatePoint } from './calculateDistanceToInfrastructure';

const ALL_NODES = [...AIRPORT_NODES, ...INDUSTRIAL_ZONES, ...INFRASTRUCTURE_NODES, ...ROAD_CORRIDORS, ...TOURISM_ZONES];

export type NearbyInfrastructure = {
  id: string;
  name: string;
  type: string;
  distanceKm: number;
  city: string;
};

export type InfrastructureDistances = {
  airport?: number;
  industrial_zone?: number;
  university?: number;
  hospital?: number;
  road_corridor?: number;
  tourism_zone?: number;
};

export function detectNearbyInfrastructure(coordinates: CoordinatePoint, city?: string) {
  const normalizedCity = (city || '').trim().toLowerCase();
  const matches = ALL_NODES
    .filter((node) => !normalizedCity || node.city === normalizedCity)
    .map((node) => ({
      id: node.id,
      name: node.name,
      type: node.type,
      city: node.city,
      distanceKm: calculateDistanceToInfrastructure(coordinates, {
        latitude: node.latitude,
        longitude: node.longitude,
      }),
      radiusKm: node.radiusKm,
    }))
    .sort((left, right) => left.distanceKm - right.distanceKm);

  const nearbyInfrastructure: NearbyInfrastructure[] = matches.filter((item) => item.distanceKm <= item.radiusKm).map(({ radiusKm, ...item }) => item);
  const infrastructureDistances: InfrastructureDistances = {};

  for (const item of matches) {
    if (infrastructureDistances[item.type as keyof InfrastructureDistances] === undefined) {
      infrastructureDistances[item.type as keyof InfrastructureDistances] = item.distanceKm;
    }
  }

  return {
    nearbyInfrastructure,
    infrastructureDistances,
    nearestNodes: matches.slice(0, 8).map(({ radiusKm, ...item }) => item),
  };
}
