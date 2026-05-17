import { calculateSubdivisionPotential } from './calculateSubdivisionPotential';
import { calculateFrontageDepthScore } from './calculateFrontageDepthScore';
import { calculateDensityPotential } from './calculateDensityPotential';
import { calculateDeveloperROI } from './calculateDeveloperROI';
import { detectParcelMergeOpportunity } from './detectParcelMergeOpportunity';
import { simulateRezoningUpside } from './simulateRezoningUpside';
import { calculateProjectability } from './calculateProjectability';
import { buildDevelopmentScenario } from './buildDevelopmentScenario';

export type DevelopmentIntelligenceOutput = {
  subdivisionPotential: ReturnType<typeof calculateSubdivisionPotential>;
  frontageDepthScore: ReturnType<typeof calculateFrontageDepthScore>;
  densityPotential: ReturnType<typeof calculateDensityPotential>;
  developerROI: ReturnType<typeof calculateDeveloperROI>;
  parcelMergeOpportunity: ReturnType<typeof detectParcelMergeOpportunity>;
  rezoningUpside: ReturnType<typeof simulateRezoningUpside>;
  projectability: ReturnType<typeof calculateProjectability>;
  developmentScenario: ReturnType<typeof buildDevelopmentScenario>;
  developmentSignals: string[];
};

export function buildDevelopmentIntelligence(input: {
  areaM2?: number;
  zoningStatus?: string;
  district?: string;
  roadAccess?: string;
  addressText?: string;
  mahalleOrKoy?: string;
  pricingDeltaRatio?: number;
  infrastructureScore?: number;
  roadAccessScore?: number;
  regionalDemandScore?: number;
}): DevelopmentIntelligenceOutput {
  const subdivisionPotential = calculateSubdivisionPotential({
    areaM2: input.areaM2,
    zoningStatus: input.zoningStatus,
    roadAccess: input.roadAccess,
  });

  const frontageDepthScore = calculateFrontageDepthScore({
    areaM2: input.areaM2,
    roadAccess: input.roadAccess,
    addressText: input.addressText,
    mahalleOrKoy: input.mahalleOrKoy,
  });

  const densityPotential = calculateDensityPotential({
    zoningStatus: input.zoningStatus,
    areaM2: input.areaM2,
  });

  const developerROI = calculateDeveloperROI({
    densityScore: densityPotential.score,
    demandScore: input.regionalDemandScore,
    infrastructureScore: input.infrastructureScore,
    pricingDeltaRatio: input.pricingDeltaRatio,
    frontageDepthScore: frontageDepthScore.score,
  });

  const parcelMergeOpportunity = detectParcelMergeOpportunity({
    areaM2: input.areaM2,
    district: input.district,
    zoningStatus: input.zoningStatus,
  });

  const rezoningUpside = simulateRezoningUpside({
    zoningStatus: input.zoningStatus,
    infrastructureScore: input.infrastructureScore,
    roadAccessScore: input.roadAccessScore,
    demandScore: input.regionalDemandScore,
  });

  const projectability = calculateProjectability({
    densityScore: densityPotential.score,
    infrastructureScore: input.infrastructureScore,
    roadAccessScore: input.roadAccessScore,
    frontageDepthScore: frontageDepthScore.score,
    subdivisionScore: subdivisionPotential.score,
    rezoningScore: rezoningUpside.score,
  });

  const developmentScenario = buildDevelopmentScenario({
    subdivisionLevel: subdivisionPotential.level,
    densityCategory: densityPotential.category,
    roiScenario: developerROI.scenario,
    rezoningScenario: rezoningUpside.scenario,
    projectabilityLevel: projectability.level,
  });

  const developmentSignals = Array.from(new Set([
    ...subdivisionPotential.splitabilitySignals,
    ...frontageDepthScore.geometrySignals,
    ...densityPotential.supportingSignals,
    ...developerROI.roiSignals,
    ...parcelMergeOpportunity.signals,
    ...rezoningUpside.signals,
    ...projectability.blockers,
  ]));

  return {
    subdivisionPotential,
    frontageDepthScore,
    densityPotential,
    developerROI,
    parcelMergeOpportunity,
    rezoningUpside,
    projectability,
    developmentScenario,
    developmentSignals,
  };
}

export { calculateSubdivisionPotential } from './calculateSubdivisionPotential';
export { calculateFrontageDepthScore } from './calculateFrontageDepthScore';
export { calculateDensityPotential } from './calculateDensityPotential';
export { calculateDeveloperROI } from './calculateDeveloperROI';
export { detectParcelMergeOpportunity } from './detectParcelMergeOpportunity';
export { simulateRezoningUpside } from './simulateRezoningUpside';
export { calculateProjectability } from './calculateProjectability';
export { buildDevelopmentScenario } from './buildDevelopmentScenario';
