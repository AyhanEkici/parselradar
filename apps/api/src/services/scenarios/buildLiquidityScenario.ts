export function buildLiquidityScenario(input: {
  liquidityBands: Array<{ key: string; weightPercent: number }>;
}) {
  const high = input.liquidityBands.find((row) => row.key === 'high')?.weightPercent || 0;
  const medium = input.liquidityBands.find((row) => row.key === 'medium')?.weightPercent || 0;
  const low = input.liquidityBands.find((row) => row.key === 'low')?.weightPercent || 0;

  const liquidityResilienceScore = Number((high * 0.7 + medium * 0.4 - low * 0.3).toFixed(2));

  return {
    scenario: 'LIQUIDITY',
    liquidityResilienceScore,
    profile: { high, medium, low },
    interpretation: liquidityResilienceScore >= 40 ? 'LIQUIDITY_BUFFER_STRONG' : 'LIQUIDITY_BUFFER_LIMITED',
  };
}
