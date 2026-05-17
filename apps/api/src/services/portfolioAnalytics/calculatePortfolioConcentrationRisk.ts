export function calculatePortfolioConcentrationRisk(input: {
  byCity: Array<{ key: string; weightPercent: number }>;
  byAssetType: Array<{ key: string; weightPercent: number }>;
  byLiquidityBand: Array<{ key: string; weightPercent: number }>;
}) {
  const topCity = input.byCity[0];
  const topAssetType = input.byAssetType[0];
  const topLiquidity = input.byLiquidityBand[0];

  const concentrationIndex = Number(
    ((topCity?.weightPercent || 0) * 0.4 + (topAssetType?.weightPercent || 0) * 0.35 + (topLiquidity?.weightPercent || 0) * 0.25).toFixed(2)
  );

  let riskTier: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (concentrationIndex >= 45) riskTier = 'HIGH';
  else if (concentrationIndex >= 30) riskTier = 'MEDIUM';

  return {
    concentrationIndex,
    riskTier,
    topConcentrations: {
      city: topCity || null,
      assetType: topAssetType || null,
      liquidityBand: topLiquidity || null,
    },
    note: 'Concentration risk is portfolio-internal and does not represent external market loss probability.',
  };
}
