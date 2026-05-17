import { calculateSubdivisionPotential, SubdivisionPotential } from './calculateSubdivisionPotential';
import { calculateFrontageDepthScore, FrontageDepthResult } from './calculateFrontageDepthScore';
import { calculateDensityPotential, DensityClassification } from './calculateDensityPotential';
import { calculateDeveloperROI, DeveloperROITier } from './calculateDeveloperROI';
import { detectParcelMergeOpportunity, ParcelMergeOpportunity } from './detectParcelMergeOpportunity';
import { simulateRezoningUpside, RezoningUpsideResult } from './simulateRezoningUpside';
import { calculateProjectability, ProjectabilityResult } from './calculateProjectability';

export type DevelopmentScenarioOutput = {
  subdivisionPotential: { potential: SubdivisionPotential; score: number; message: string };
  frontageDepthScore: FrontageDepthResult;
  densityPotential: { classification: DensityClassification; score: number };
  developerROI: { tier: DeveloperROITier; score: number; description: string };
  parcelMergeOpportunity: ParcelMergeOpportunity;
  rezoningUpside: RezoningUpsideResult;
  projectability: ProjectabilityResult;
  developmentSignals: string[];
  developmentSummary: string;
};

export function buildDevelopmentScenario(input: {
  areaM2?: number;
  city?: string;
  district?: string;
  zoning?: string;
  frontageM?: number;
  depthM?: number;
  isCorner?: boolean;
  shapeDescription?: string;
  marketHeat?: string;
  roadAccessScore?: number;
  infrastructureScore?: number;
  growthPhase?: 'emerging' | 'developing' | 'mature' | 'saturated';
  avgComparablePricePerM2?: number;
}): DevelopmentScenarioOutput {
  const subdivision = calculateSubdivisionPotential({
    areaM2: input.areaM2,
    zoning: input.zoning,
    district: input.district,
  });

  const frontageDepth = calculateFrontageDepthScore({
    frontageM: input.frontageM,
    depthM: input.depthM,
    areaM2: input.areaM2,
    isCorner: input.isCorner,
    shapeDescription: input.shapeDescription,
  });

  const density = calculateDensityPotential({
    areaM2: input.areaM2,
    zoning: input.zoning,
    city: input.city,
  });

  const developerROI = calculateDeveloperROI({
    areaM2: input.areaM2,
    densityScore: density.score,
    marketHeat: input.marketHeat,
    infrastructureScore: input.infrastructureScore,
    rezoningPotential: 50,
    projectabilityScore: 65,
  });

  const merge = detectParcelMergeOpportunity({
    areaM2: input.areaM2,
    district: input.district,
    zoning: input.zoning,
    infraScore: input.infrastructureScore,
  });

  const rezoning = simulateRezoningUpside({
    city: input.city,
    district: input.district,
    growthPhase: input.growthPhase,
    infraScore: input.infrastructureScore,
  });

  const projectability = calculateProjectability({
    areaM2: input.areaM2,
    zoning: input.zoning,
    roadAccessScore: input.roadAccessScore,
    infrastructureScore: input.infrastructureScore,
    densityPotential: density.classification,
    frontageDepthScore: frontageDepth.score,
  });

  const signals: string[] = [];

  if (subdivision.potential === 'high') signals.push(`High subdivision potential: ${subdivision.message}`);
  if (frontageDepth.quality === 'excellent') signals.push('Excellent frontage/depth geometry');
  if (merge.opportunity) signals.push(`Merge opportunity: ${merge.signals.join(', ')}`);
  if (rezoning.scenario !== 'stable') signals.push(`Rezoning upside: ${rezoning.scenario}`);
  if (projectability.level === 'easy') signals.push('Easy to develop parcel');

  const summary =
    `Development readiness: ${projectability.level}. ` +
    `Density potential: ${density.classification}. ` +
    `Developer ROI tier: ${developerROI.tier}. ` +
    `Rezoning scenario: ${rezoning.scenario}. ` +
    (merge.opportunity ? `Merge signals detected: ${merge.signals.length}.` : 'No merge signals.');

  return {
    subdivisionPotential: subdivision,
    frontageDepthScore: frontageDepth,
    densityPotential: density,
    developerROI,
    parcelMergeOpportunity: merge,
    rezoningUpside: rezoning,
    projectability,
    developmentSignals: signals,
    developmentSummary: summary,
  };
}

export { calculateSubdivisionPotential } from './calculateSubdivisionPotential';
export { calculateFrontageDepthScore } from './calculateFrontageDepthScore';
export { calculateDensityPotential } from './calculateDensityPotential';
export { calculateDeveloperROI } from './calculateDeveloperROI';
export { detectParcelMergeOpportunity } from './detectParcelMergeOpportunity';
export { simulateRezoningUpside } from './simulateRezoningUpside';
export { calculateProjectability } from './calculateProjectability';
