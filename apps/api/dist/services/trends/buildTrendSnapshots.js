"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTrendSnapshots = buildTrendSnapshots;
const calculateDistrictVolatility_1 = require("./calculateDistrictVolatility");
const calculateLiquidityTrend_1 = require("./calculateLiquidityTrend");
const calculateMarketVelocity_1 = require("./calculateMarketVelocity");
function buildTrendSnapshots(input) {
    const velocity = (0, calculateMarketVelocity_1.calculateMarketVelocity)({
        marketMomentum: input.marketMomentum,
        comparableCount: input.comparableCount,
        liquidityScore: input.liquidityScore,
    });
    const volatility = (0, calculateDistrictVolatility_1.calculateDistrictVolatility)({
        priceAccelerationScore: input.priceAccelerationScore,
        districtHeat: input.districtHeat,
        connectorDegradedCount: input.connectorDegradedCount,
    });
    const liquidity = (0, calculateLiquidityTrend_1.calculateLiquidityTrend)({
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
