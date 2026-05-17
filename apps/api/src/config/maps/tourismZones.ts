import type { InfrastructureNode } from './airportNodes';

export const TOURISM_ZONES: InfrastructureNode[] = [
  { id: 'antalya-lara', name: 'Antalya Lara Tourism Belt', city: 'antalya', latitude: 36.8566, longitude: 30.8309, type: 'tourism_zone', radiusKm: 18 },
  { id: 'antalya-kemer', name: 'Kemer Tourism Corridor', city: 'antalya', latitude: 36.6028, longitude: 30.5598, type: 'tourism_zone', radiusKm: 24 },
  { id: 'izmir-cesme', name: 'Cesme Tourism Corridor', city: 'izmir', latitude: 38.3230, longitude: 26.3050, type: 'tourism_zone', radiusKm: 24 },
  { id: 'istanbul-historic-peninsula', name: 'Historic Peninsula Tourism Zone', city: 'istanbul', latitude: 41.0086, longitude: 28.9802, type: 'tourism_zone', radiusKm: 14 },
];
