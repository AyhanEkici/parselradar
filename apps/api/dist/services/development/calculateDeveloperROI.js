"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDeveloperROI = calculateDeveloperROI;
const developerThresholds_1 = require("../../config/development/developerThresholds");
function calculateDeveloperROI(input) {
    const signals = [];
    let score = input.densityScore * 0.34 + (input.demandScore || 55) * 0.18 + (input.infrastructureScore || 55) * 0.18 + input.frontageDepthScore * 0.12;
    const pricingDeltaRatio = input.pricingDeltaRatio || 0;
    if (pricingDeltaRatio <= -0.08) {
        score += 12;
        signals.push('below_market_entry');
    }
    else if (pricingDeltaRatio >= 0.12) {
        score -= 10;
        signals.push('priced_above_comparables');
    }
    if ((input.infrastructureScore || 0) >= 70) {
        signals.push('infrastructure_support');
    }
    if ((input.demandScore || 0) >= 75) {
        signals.push('regional_absorption_support');
    }
    const rounded = Math.max(0, Math.min(100, Math.round(score)));
    const scenario = rounded >= developerThresholds_1.DEVELOPER_ROI_THRESHOLDS.aggressive ? 'aggressive' : rounded >= developerThresholds_1.DEVELOPER_ROI_THRESHOLDS.moderate ? 'moderate' : 'conservative';
    return {
        score: rounded,
        scenario,
        roiSignals: signals,
    };
}
