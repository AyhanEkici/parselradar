"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectMarketMomentum = detectMarketMomentum;
const signalThresholds_1 = require("../../config/connectors/signalThresholds");
function detectMarketMomentum(input) {
    const heatScoreMap = {
        HOT: 82,
        ACTIVE: 68,
        STABLE: 52,
        COLD: 34,
    };
    const heatScore = heatScoreMap[String(input.marketHeat || 'STABLE').toUpperCase()] ?? 50;
    const pricingLift = Math.max(-20, Math.min(20, Math.round((input.pricingDeltaRatio || 0) * 100)));
    const freshnessLift = Math.round((input.freshnessScore || 50) * 0.2) - 10;
    const connectorLift = Math.round((input.connectorLiveRatio || 0) * 16);
    const momentumScore = Math.max(0, Math.min(100, heatScore + pricingLift + freshnessLift + connectorLift));
    const momentum = momentumScore >= signalThresholds_1.SIGNAL_THRESHOLDS.momentum.high
        ? 'HIGH'
        : momentumScore >= signalThresholds_1.SIGNAL_THRESHOLDS.momentum.medium
            ? 'MEDIUM'
            : 'LOW';
    return {
        momentum,
        marketMomentum: momentumScore,
        trendSignals: [
            `momentum_${momentum.toLowerCase()}`,
            `heat_${String(input.marketHeat || 'stable').toLowerCase()}`,
        ],
    };
}
