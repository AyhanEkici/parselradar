export function calculateLiquidityTrend(input: {
  liquiditySignal?: string;
  comparableCount?: number;
  marketMomentum?: number;
}) {
  const signalMap: Record<string, number> = {
    liquid: 78,
    balanced: 58,
    thin: 34,
  };

  const signalScore = signalMap[String(input.liquiditySignal || 'balanced').toLowerCase()] ?? 52;
  const comparableLift = Math.min(14, Math.round((input.comparableCount || 0) * 0.9));
  const momentumLift = Math.round((input.marketMomentum || 0) * 0.12) - 6;
  const liquidityTrendScore = Math.max(0, Math.min(100, signalScore + comparableLift + momentumLift));

  return {
    liquidityTrendScore,
    liquidityTrend: liquidityTrendScore >= 70 ? 'IMPROVING' : liquidityTrendScore >= 50 ? 'STABLE' : 'THINNING',
  };
}
