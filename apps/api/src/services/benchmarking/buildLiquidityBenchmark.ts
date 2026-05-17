export function buildLiquidityBenchmark(input: {
  exposureByLiquidityBand: Array<{ key: string; weightPercent: number }>;
}) {
  const baseline = {
    high: 34,
    medium: 33,
    low: 33,
  };

  return {
    methodology: 'Internal operating benchmark for liquidity balance. Not external market data.',
    rows: input.exposureByLiquidityBand.map((row) => ({
      liquidityBand: row.key,
      portfolioWeightPercent: row.weightPercent,
      baselineWeightPercent: baseline[row.key as keyof typeof baseline] || 0,
      deltaPercent: Number((row.weightPercent - (baseline[row.key as keyof typeof baseline] || 0)).toFixed(2)),
    })),
  };
}
