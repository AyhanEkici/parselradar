import { calculateDistrictVolatility } from './calculateDistrictVolatility';
import { calculateLiquidityTrend } from './calculateLiquidityTrend';
import { calculateMarketVelocity } from './calculateMarketVelocity';

export function buildTrendSnapshots(input: {
  marketMomentum?: number;
  comparableCount?: number;
  liquidityScore?: number;
  liquiditySignal?: string;
  districtHeat?: number;
  priceAccelerationScore?: number;
  connectorDegradedCount?: number;
}) {
  const velocity = calculateMarketVelocity({
    marketMomentum: input.marketMomentum,
    comparableCount: input.comparableCount,
    liquidityScore: input.liquidityScore,
  });

  const volatility = calculateDistrictVolatility({
    priceAccelerationScore: input.priceAccelerationScore,
    districtHeat: input.districtHeat,
    connectorDegradedCount: input.connectorDegradedCount,
  });

  const liquidity = calculateLiquidityTrend({
    liquiditySignal: input.liquiditySignal,
    comparableCount: input.comparableCount,
    marketMomentum: input.marketMomentum,
  });

  return {
    velocity,
    volatility,
    liquidity,
    snapshots: [
      `velocity_${velocity.velocityLabel}`,
      `volatility_${volatility.volatilityBand.toLowerCase()}`,
      `liquidity_${liquidity.liquidityTrend.toLowerCase()}`,
    ],
  };
}
