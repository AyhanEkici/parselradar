export function buildRegionalBenchmark(input: {
  exposureByCity: Array<{ key: string; weightPercent: number }>;
}) {
  const count = input.exposureByCity.length || 1;
  const baselineEqualWeight = Number((100 / count).toFixed(2));

  const rows = input.exposureByCity.map((row) => ({
    city: row.key,
    portfolioWeightPercent: row.weightPercent,
    baselineWeightPercent: baselineEqualWeight,
    deltaPercent: Number((row.weightPercent - baselineEqualWeight).toFixed(2)),
  }));

  return {
    methodology: 'Internal equal-weight regional baseline based on current portfolio footprint.',
    rows,
  };
}
