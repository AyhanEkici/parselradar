export type DevelopmentZone = {
  city: string;
  district?: string;
  zoneName: string;
  developmentPhase: 'emerging' | 'developing' | 'mature' | 'saturated';
  growthIndicators: number;
};

export const DEVELOPMENT_ZONES: DevelopmentZone[] = [
  { city: 'istanbul', district: 'beylikduzu', zoneName: 'Beylikduzu Tech Corridor', developmentPhase: 'developing', growthIndicators: 82 },
  { city: 'istanbul', district: 'acibadem', zoneName: 'Acibadem Medical Hub', developmentPhase: 'mature', growthIndicators: 68 },
  { city: 'istanbul', district: 'kadikoy', zoneName: 'Kadikoy Retail', developmentPhase: 'saturated', growthIndicators: 55 },
  { city: 'istanbul', district: 'atasehir', zoneName: 'Atasehir Financial District', developmentPhase: 'mature', growthIndicators: 72 },
  { city: 'istanbul', district: 'pendik', zoneName: 'Pendik Industrial Expansion', developmentPhase: 'developing', growthIndicators: 78 },

  { city: 'ankara', district: 'cankaya', zoneName: 'Cankaya Business District', developmentPhase: 'mature', growthIndicators: 65 },
  { city: 'ankara', district: 'kecioren', zoneName: 'Kecioren Growth Zone', developmentPhase: 'developing', growthIndicators: 75 },

  { city: 'izmir', district: 'alsancak', zoneName: 'Alsancak Commercial', developmentPhase: 'mature', growthIndicators: 62 },
  { city: 'izmir', district: 'karsiyaka', zoneName: 'Karsiyaka Waterfront', developmentPhase: 'developing', growthIndicators: 76 },

  { city: 'bursa', district: 'osmangazi', zoneName: 'Osmangazi Tech Park', developmentPhase: 'emerging', growthIndicators: 84 },

  { city: 'antalya', district: 'muratpasa', zoneName: 'Muratpasa Tourism Hub', developmentPhase: 'mature', growthIndicators: 70 },

  { city: 'kayseri', district: 'melikgazi', zoneName: 'Melikgazi Emerging Zone', developmentPhase: 'emerging', growthIndicators: 80 },
];

export const DEVELOPMENT_PHASE_SCORES = {
  emerging: 85,
  developing: 78,
  mature: 62,
  saturated: 45,
} as const;
