export const PARCEL_MERGE_RULES = {
  minMergeSize: 2000,
  optimalMergeSize: 5000,
  maxMergeCount: 5,
  minSimilarityForMerge: 0.6,
  adjacencyBonus: 20,
  sameZoningBonus: 15,
  proximityRadiusKm: 0.5,
} as const;

export const MERGE_OPPORTUNITY_SIGNALS = {
  assembly: 'Land assembly opportunity',
  developer_aggregation: 'Developer aggregation zone',
  expansion_potential: 'Expansion potential for existing owner',
  consolidation: 'Consolidation opportunity',
} as const;
