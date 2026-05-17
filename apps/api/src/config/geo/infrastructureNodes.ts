export type InfrastructureNode = {
  city: string;
  name: string;
  influence: 'HIGH' | 'MEDIUM' | 'LOW';
  type: 'airport' | 'osb' | 'hospital' | 'university' | 'logistics_hub' | 'tourism_zone';
  proximityBonusKm: number;
};

export const INFRASTRUCTURE_NODES: InfrastructureNode[] = [
  { city: 'istanbul', name: 'Istanbul Airport (IST)', influence: 'HIGH', type: 'airport', proximityBonusKm: 35 },
  { city: 'istanbul', name: 'Sabiha Gokcen Airport', influence: 'MEDIUM', type: 'airport', proximityBonusKm: 30 },
  { city: 'istanbul', name: 'TOSB Logistics Hub', influence: 'HIGH', type: 'logistics_hub', proximityBonusKm: 25 },
  { city: 'istanbul', name: 'Beylikduzu OSB', influence: 'MEDIUM', type: 'osb', proximityBonusKm: 20 },

  { city: 'ankara', name: 'Ankara Airport', influence: 'MEDIUM', type: 'airport', proximityBonusKm: 30 },
  { city: 'ankara', name: 'Ankara Organized Zone', influence: 'MEDIUM', type: 'osb', proximityBonusKm: 25 },

  { city: 'izmir', name: 'Izmir Airport', influence: 'MEDIUM', type: 'airport', proximityBonusKm: 28 },
  { city: 'izmir', name: 'Izmir Port Area', influence: 'HIGH', type: 'logistics_hub', proximityBonusKm: 22 },

  { city: 'bursa', name: 'Bursa OSB', influence: 'MEDIUM', type: 'osb', proximityBonusKm: 20 },

  { city: 'antalya', name: 'Antalya Airport', influence: 'HIGH', type: 'airport', proximityBonusKm: 32 },
  { city: 'antalya', name: 'Tourism Zone', influence: 'HIGH', type: 'tourism_zone', proximityBonusKm: 30 },

  { city: 'kayseri', name: 'Kayseri OSB', influence: 'MEDIUM', type: 'osb', proximityBonusKm: 22 },

  { city: 'gaziantep', name: 'Gaziantep Organized Zone', influence: 'MEDIUM', type: 'osb', proximityBonusKm: 20 },
];

export const INFRASTRUCTURE_INFLUENCE_WEIGHTS = {
  airport: { score_boost: 18, weight: 0.3 },
  osb: { score_boost: 20, weight: 0.3 },
  hospital: { score_boost: 8, weight: 0.15 },
  university: { score_boost: 10, weight: 0.15 },
  logistics_hub: { score_boost: 22, weight: 0.35 },
  tourism_zone: { score_boost: 15, weight: 0.25 },
} as const;
