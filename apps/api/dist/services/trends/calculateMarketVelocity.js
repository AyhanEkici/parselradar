"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateMarketVelocity = calculateMarketVelocity;
const marketVelocityProfiles_1 = require("../../config/connectors/marketVelocityProfiles");
function calculateMarketVelocity(input) {
    const momentum = input.marketMomentum || 0;
    const comparableLift = Math.min(24, (input.comparableCount || 0) * 1.5);
    const liquidity = input.liquidityScore || 0;
    const velocityScore = Math.max(0, Math.min(100, Math.round(momentum * 0.5 + comparableLift + liquidity * 0.26)));
    const profile = Object.values(marketVelocityProfiles_1.MARKET_VELOCITY_PROFILES).find((item) => velocityScore >= item.minScore && velocityScore <= item.maxScore) || marketVelocityProfiles_1.MARKET_VELOCITY_PROFILES.balanced;
    return {
        velocityScore,
        velocityLabel: profile.label,
    };
}
