export const DENSITY_RULES = {
  low_rise: {
    maxStories: 4,
    maxFloorArea: 8,
    minParcelM2: 500,
    typicalZoning: ['residential', 'konut', 'villa'],
  },
  mid_rise: {
    maxStories: 8,
    maxFloorArea: 4.0,
    minParcelM2: 2000,
    typicalZoning: ['mixed', 'residential_commercial', 'residential'],
  },
  high_rise: {
    maxStories: 25,
    maxFloorArea: 5.0,
    minParcelM2: 5000,
    typicalZoning: ['commercial', 'ticari', 'mixed_use'],
  },
  mixed_use: {
    maxStories: 15,
    maxFloorArea: 4.5,
    minParcelM2: 3000,
    typicalZoning: ['ticari', 'mixed', 'commercial'],
  },
  industrial: {
    maxStories: 3,
    maxFloorArea: 2.5,
    minParcelM2: 8000,
    typicalZoning: ['sanayi', 'industrial', 'logistics'],
  },
  tourism: {
    maxStories: 10,
    maxFloorArea: 3.5,
    minParcelM2: 2000,
    typicalZoning: ['tourism', 'hospitality', 'resort'],
  },
} as const;

export const DENSITY_POTENTIAL_SCORES = {
  low_rise: 45,
  mid_rise: 70,
  high_rise: 88,
  mixed_use: 78,
  industrial: 62,
  tourism: 75,
} as const;
