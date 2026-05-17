export type DensityCategory = 'low_rise' | 'mid_rise' | 'mixed_use' | 'industrial' | 'tourism';

export type DensityRule = {
  zoningKeywords: string[];
  category: DensityCategory;
  baseScore: number;
  minimumAreaM2: number;
  areaScalingStepM2: number;
  maxAreaBonus: number;
};

export const DENSITY_RULES: DensityRule[] = [
  {
    zoningKeywords: ['konut', 'residential', 'villa'],
    category: 'low_rise',
    baseScore: 54,
    minimumAreaM2: 350,
    areaScalingStepM2: 450,
    maxAreaBonus: 16,
  },
  {
    zoningKeywords: ['ticari', 'commercial', 'karma', 'mixed'],
    category: 'mixed_use',
    baseScore: 74,
    minimumAreaM2: 600,
    areaScalingStepM2: 700,
    maxAreaBonus: 18,
  },
  {
    zoningKeywords: ['sanayi', 'industrial', 'depo', 'logistics'],
    category: 'industrial',
    baseScore: 76,
    minimumAreaM2: 1000,
    areaScalingStepM2: 1200,
    maxAreaBonus: 15,
  },
  {
    zoningKeywords: ['turizm', 'tourism', 'otel', 'hotel'],
    category: 'tourism',
    baseScore: 72,
    minimumAreaM2: 800,
    areaScalingStepM2: 900,
    maxAreaBonus: 14,
  },
  {
    zoningKeywords: ['imar', 'gelisme', 'gelişme', 'apartman'],
    category: 'mid_rise',
    baseScore: 66,
    minimumAreaM2: 500,
    areaScalingStepM2: 600,
    maxAreaBonus: 18,
  },
];

export const DEFAULT_DENSITY_RULE: DensityRule = {
  zoningKeywords: [],
  category: 'low_rise',
  baseScore: 46,
  minimumAreaM2: 400,
  areaScalingStepM2: 500,
  maxAreaBonus: 12,
};
