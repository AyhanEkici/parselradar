export const PARCEL_MERGE_RULES = {
  minimumAssemblyAreaM2: 1800,
  expansionAreaThresholdM2: 3200,
  districtAggregationBonuses: {
    beylikduzu: 14,
    pendik: 16,
    atasehir: 10,
    osmangazi: 12,
    muratpasa: 11,
    melikgazi: 12,
  },
  zoningBonuses: {
    industrial: 16,
    mixed: 14,
    commercial: 12,
    residential: 8,
    tourism: 10,
  },
} as const;
