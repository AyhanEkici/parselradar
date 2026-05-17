import type { InfrastructureNode } from './airportNodes';

export const ROAD_CORRIDORS: InfrastructureNode[] = [
  { id: 'tem-istanbul', name: 'TEM Corridor Istanbul', city: 'istanbul', latitude: 41.0784, longitude: 28.8403, type: 'road_corridor', radiusKm: 16 },
  { id: 'e5-istanbul', name: 'D100 Corridor Istanbul', city: 'istanbul', latitude: 41.0128, longitude: 28.9254, type: 'road_corridor', radiusKm: 12 },
  { id: 'ankara-ring', name: 'Ankara Ring Corridor', city: 'ankara', latitude: 39.9255, longitude: 32.7486, type: 'road_corridor', radiusKm: 16 },
  { id: 'izmir-ring', name: 'Izmir Ring Corridor', city: 'izmir', latitude: 38.4237, longitude: 27.2207, type: 'road_corridor', radiusKm: 16 },
  { id: 'bursa-balikesir', name: 'Bursa West Corridor', city: 'bursa', latitude: 40.2052, longitude: 28.9135, type: 'road_corridor', radiusKm: 16 },
  { id: 'antalya-d400', name: 'Antalya D400 Corridor', city: 'antalya', latitude: 36.9047, longitude: 30.6763, type: 'road_corridor', radiusKm: 14 },
];
