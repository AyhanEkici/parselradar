import type { InfrastructureNode } from './airportNodes';

export const INDUSTRIAL_ZONES: InfrastructureNode[] = [
  { id: 'beylikduzu-osb', name: 'Beylikduzu OSB', city: 'istanbul', latitude: 40.9929, longitude: 28.6752, type: 'industrial_zone', radiusKm: 18 },
  { id: 'pendik-teknopark', name: 'Pendik Industrial Belt', city: 'istanbul', latitude: 40.8784, longitude: 29.2551, type: 'industrial_zone', radiusKm: 18 },
  { id: 'ankara-osb', name: 'Ankara Organized Industrial Zone', city: 'ankara', latitude: 39.9281, longitude: 32.5538, type: 'industrial_zone', radiusKm: 22 },
  { id: 'bursa-osb', name: 'Bursa Organized Industrial Zone', city: 'bursa', latitude: 40.2289, longitude: 28.9759, type: 'industrial_zone', radiusKm: 20 },
  { id: 'kayseri-osb', name: 'Kayseri Organized Industrial Zone', city: 'kayseri', latitude: 38.7319, longitude: 35.3214, type: 'industrial_zone', radiusKm: 20 },
  { id: 'gaziantep-osb', name: 'Gaziantep Organized Industrial Zone', city: 'gaziantep', latitude: 37.1353, longitude: 37.2350, type: 'industrial_zone', radiusKm: 22 },
];
