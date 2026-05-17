function ratioToScore(ratio: number) {
  return Math.max(0, Math.min(100, Number((ratio * 100).toFixed(2))));
}

export function calculatePortfolioDiversification(input: {
  totalValue: number;
  byCity: Record<string, number>;
  byAssetType: Record<string, number>;
  byLiquidityBand: Record<string, number>;
}) {
  const totalValue = input.totalValue || 1;

  const computeHhi = (bucket: Record<string, number>) => {
    const shares = Object.values(bucket).map((value) => Number(value || 0) / totalValue);
    return shares.reduce((sum, share) => sum + share * share, 0);
  };

  const cityHhi = computeHhi(input.byCity);
  const assetTypeHhi = computeHhi(input.byAssetType);
  const liquidityHhi = computeHhi(input.byLiquidityBand);

  const cityDiversification = ratioToScore(1 - cityHhi);
  const assetDiversification = ratioToScore(1 - assetTypeHhi);
  const liquidityDiversification = ratioToScore(1 - liquidityHhi);
  const overall = Number(((cityDiversification + assetDiversification + liquidityDiversification) / 3).toFixed(2));

  return {
    overallDiversificationScore: overall,
    dimensions: {
      cityDiversification,
      assetDiversification,
      liquidityDiversification,
    },
    concentrationSignals: {
      cityHhi: Number(cityHhi.toFixed(4)),
      assetTypeHhi: Number(assetTypeHhi.toFixed(4)),
      liquidityHhi: Number(liquidityHhi.toFixed(4)),
    },
  };
}
