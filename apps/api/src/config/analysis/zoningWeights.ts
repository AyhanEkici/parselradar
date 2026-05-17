export type ZoningScoreProfile = {
  zoningPotentialScore: number;
  desirabilityScore: number;
};

export const ZONING_WEIGHTS: Record<string, ZoningScoreProfile> = {
  konut: { zoningPotentialScore: 85, desirabilityScore: 82 },
  residential: { zoningPotentialScore: 85, desirabilityScore: 82 },
  ticari: { zoningPotentialScore: 90, desirabilityScore: 88 },
  commercial: { zoningPotentialScore: 90, desirabilityScore: 88 },
  mixed: { zoningPotentialScore: 88, desirabilityScore: 86 },
  karma: { zoningPotentialScore: 88, desirabilityScore: 86 },
  sanayi: { zoningPotentialScore: 72, desirabilityScore: 68 },
  industrial: { zoningPotentialScore: 72, desirabilityScore: 68 },
  tarla: { zoningPotentialScore: 35, desirabilityScore: 30 },
  tarim: { zoningPotentialScore: 35, desirabilityScore: 30 },
  agricultural: { zoningPotentialScore: 35, desirabilityScore: 30 },
  sit: { zoningPotentialScore: 25, desirabilityScore: 22 },
  protected: { zoningPotentialScore: 25, desirabilityScore: 22 },
  park: { zoningPotentialScore: 25, desirabilityScore: 22 },
};

export const DEFAULT_ZONING_PROFILE: ZoningScoreProfile = {
  zoningPotentialScore: 45,
  desirabilityScore: 50,
};

export const LAND_USE_DESIRABILITY_WEIGHTS = {
  zoningDesirability: 0.5,
  infrastructureSupport: 0.3,
  parcelSizeFit: 0.2,
};
