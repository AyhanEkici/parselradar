export const ZONING_SCENARIO_WEIGHTS = {
  stable: {
    baseScore: 42,
    infraMultiplier: 0.12,
    demandMultiplier: 0.1,
    roadMultiplier: 0.08,
  },
  moderate_upside: {
    baseScore: 61,
    infraMultiplier: 0.16,
    demandMultiplier: 0.14,
    roadMultiplier: 0.11,
  },
  speculative_upside: {
    baseScore: 74,
    infraMultiplier: 0.2,
    demandMultiplier: 0.18,
    roadMultiplier: 0.12,
  },
  infrastructure_linked: {
    baseScore: 68,
    infraMultiplier: 0.24,
    demandMultiplier: 0.12,
    roadMultiplier: 0.16,
  },
} as const;

export const ZONING_UPSIDE_KEYWORDS = {
  stable: ['arsa', 'konut', 'residential'],
  moderate_upside: ['ticari', 'commercial', 'karma', 'mixed'],
  speculative_upside: ['tarla', 'ham', 'gelisim', 'gelişim'],
  infrastructure_linked: ['sanayi', 'industrial', 'turizm', 'tourism'],
} as const;
