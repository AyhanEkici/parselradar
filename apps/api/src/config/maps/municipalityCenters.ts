export type MunicipalityCenter = {
  city: string;
  district?: string;
  latitude: number;
  longitude: number;
  confidence: number;
};

export const MUNICIPALITY_CENTERS: MunicipalityCenter[] = [
  { city: 'istanbul', district: 'kadikoy', latitude: 40.9917, longitude: 29.0277, confidence: 58 },
  { city: 'istanbul', district: 'atasehir', latitude: 40.9928, longitude: 29.1244, confidence: 56 },
  { city: 'istanbul', district: 'pendik', latitude: 40.8770, longitude: 29.2330, confidence: 54 },
  { city: 'istanbul', district: 'beylikduzu', latitude: 40.9820, longitude: 28.6399, confidence: 55 },
  { city: 'ankara', district: 'cankaya', latitude: 39.9179, longitude: 32.8627, confidence: 57 },
  { city: 'ankara', district: 'kecioren', latitude: 39.9744, longitude: 32.8663, confidence: 54 },
  { city: 'izmir', district: 'alsancak', latitude: 38.4381, longitude: 27.1467, confidence: 58 },
  { city: 'izmir', district: 'karsiyaka', latitude: 38.4574, longitude: 27.1091, confidence: 56 },
  { city: 'bursa', district: 'osmangazi', latitude: 40.1950, longitude: 29.0601, confidence: 55 },
  { city: 'antalya', district: 'muratpasa', latitude: 36.8841, longitude: 30.7056, confidence: 57 },
  { city: 'kayseri', district: 'melikgazi', latitude: 38.7322, longitude: 35.4853, confidence: 55 },
  { city: 'gaziantep', latitude: 37.0662, longitude: 37.3833, confidence: 52 },
  { city: 'konya', latitude: 37.8746, longitude: 32.4932, confidence: 52 },
];
