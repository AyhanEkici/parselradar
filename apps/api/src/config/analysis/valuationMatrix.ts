export type RegionValuationEntry = {
  city: string;
  basePricePerM2: number;
};

export type DistrictTierMultiplier = {
  label: 'CITY_CORE' | 'CITY_EDGE' | 'RURAL';
  multiplier: number;
};

export const REGION_VALUATION_MATRIX: Record<string, RegionValuationEntry> = {
  istanbul: { city: 'Istanbul', basePricePerM2: 45000 },
  ankara: { city: 'Ankara', basePricePerM2: 30000 },
  izmir: { city: 'Izmir', basePricePerM2: 36000 },
  bursa: { city: 'Bursa', basePricePerM2: 24000 },
  antalya: { city: 'Antalya', basePricePerM2: 38000 },
  adana: { city: 'Adana', basePricePerM2: 22000 },
  konya: { city: 'Konya', basePricePerM2: 20000 },
  gaziantep: { city: 'Gaziantep', basePricePerM2: 21000 },
  kayseri: { city: 'Kayseri', basePricePerM2: 23000 },
  default: { city: 'Default', basePricePerM2: 18000 },
};

export const DISTRICT_TIER_MULTIPLIERS: Record<DistrictTierMultiplier['label'], number> = {
  CITY_CORE: 1.16,
  CITY_EDGE: 0.98,
  RURAL: 0.86,
};

export const VALUATION_BAND_WIDTH = {
  lowFactor: 0.9,
  highFactor: 1.1,
};
