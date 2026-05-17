import { DISTRICT_TREND_WEIGHTS } from '../../config/connectors/districtTrendWeights';
import { SIGNAL_THRESHOLDS } from '../../config/connectors/signalThresholds';

export function detectDistrictHeat(input: {
  pricingDeltaRatio?: number;
  marketHeat?: string;
  comparableCount?: number;
  infrastructureImpact?: number;
  liquidityScore?: number;
}) {
  const pricingScore = Math.max(0, Math.min(100, Math.round(50 + (input.pricingDeltaRatio || 0) * 240)));
  const heatMap: Record<string, number> = { HOT: 86, ACTIVE: 70, STABLE: 50, COLD: 30 };
  const marketHeatScore = heatMap[String(input.marketHeat || 'STABLE').toUpperCase()] ?? 50;
  const comparableDensity = Math.max(0, Math.min(100, Math.round((input.comparableCount || 0) * 4)));
  const infra = input.infrastructureImpact || 0;
  const liquidity = input.liquidityScore || 50;

  const districtHeat = Math.round(
    pricingScore * DISTRICT_TREND_WEIGHTS.pricingDelta +
    marketHeatScore * DISTRICT_TREND_WEIGHTS.marketHeat +
    comparableDensity * DISTRICT_TREND_WEIGHTS.comparableDensity +
    infra * DISTRICT_TREND_WEIGHTS.infrastructureLift +
    liquidity * DISTRICT_TREND_WEIGHTS.liquidity
  );

  const districtHeatLevel = districtHeat >= SIGNAL_THRESHOLDS.districtHeat.hot
    ? 'HOT'
    : districtHeat >= SIGNAL_THRESHOLDS.districtHeat.warm
      ? 'WARM'
      : 'COOL';

  return {
    districtHeat,
    districtHeatLevel,
    signal: `district_heat_${districtHeatLevel.toLowerCase()}`,
  };
}
