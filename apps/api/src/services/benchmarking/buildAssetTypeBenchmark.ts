export function buildAssetTypeBenchmark(input: {
  exposureByAssetType: Array<{ key: string; weightPercent: number }>;
}) {
  const count = input.exposureByAssetType.length || 1;
  const baselineEqualWeight = Number((100 / count).toFixed(2));

  return {
    methodology: 'Internal equal-weight asset-type baseline from available holdings only.',
    rows: input.exposureByAssetType.map((row) => ({
      assetType: row.key,
      portfolioWeightPercent: row.weightPercent,
      baselineWeightPercent: baselineEqualWeight,
      deltaPercent: Number((row.weightPercent - baselineEqualWeight).toFixed(2)),
    })),
  };
}
