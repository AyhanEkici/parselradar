"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectDistrictHeat = detectDistrictHeat;
const districtTrendWeights_1 = require("../../config/connectors/districtTrendWeights");
const signalThresholds_1 = require("../../config/connectors/signalThresholds");
function detectDistrictHeat(input) {
    const pricingScore = Math.max(0, Math.min(100, Math.round(50 + (input.pricingDeltaRatio || 0) * 240)));
    const heatMap = { HOT: 86, ACTIVE: 70, STABLE: 50, COLD: 30 };
    const marketHeatScore = heatMap[String(input.marketHeat || 'STABLE').toUpperCase()] ?? 50;
    const comparableDensity = Math.max(0, Math.min(100, Math.round((input.comparableCount || 0) * 4)));
    const infra = input.infrastructureImpact || 0;
    const liquidity = input.liquidityScore || 50;
    const districtHeat = Math.round(pricingScore * districtTrendWeights_1.DISTRICT_TREND_WEIGHTS.pricingDelta +
        marketHeatScore * districtTrendWeights_1.DISTRICT_TREND_WEIGHTS.marketHeat +
        comparableDensity * districtTrendWeights_1.DISTRICT_TREND_WEIGHTS.comparableDensity +
        infra * districtTrendWeights_1.DISTRICT_TREND_WEIGHTS.infrastructureLift +
        liquidity * districtTrendWeights_1.DISTRICT_TREND_WEIGHTS.liquidity);
    const districtHeatLevel = districtHeat >= signalThresholds_1.SIGNAL_THRESHOLDS.districtHeat.hot
        ? 'HOT'
        : districtHeat >= signalThresholds_1.SIGNAL_THRESHOLDS.districtHeat.warm
            ? 'WARM'
            : 'COOL';
    return {
        districtHeat,
        districtHeatLevel,
        signal: `district_heat_${districtHeatLevel.toLowerCase()}`,
    };
}
