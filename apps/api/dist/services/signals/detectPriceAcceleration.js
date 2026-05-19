"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectPriceAcceleration = detectPriceAcceleration;
const signalThresholds_1 = require("../../config/connectors/signalThresholds");
function detectPriceAcceleration(input) {
    const current = input.currentAvgPricePerM2 || 0;
    const baseline = input.baselinePricePerM2 || current || 1;
    const deltaRatio = baseline > 0 ? (current - baseline) / baseline : 0;
    const accelerationLevel = deltaRatio >= signalThresholds_1.SIGNAL_THRESHOLDS.acceleration.strong
        ? 'STRONG'
        : deltaRatio >= signalThresholds_1.SIGNAL_THRESHOLDS.acceleration.moderate
            ? 'MODERATE'
            : deltaRatio <= -signalThresholds_1.SIGNAL_THRESHOLDS.acceleration.moderate
                ? 'COOLING'
                : 'FLAT';
    const accelerationScore = Math.max(0, Math.min(100, Math.round(50 + deltaRatio * 260)));
    return {
        accelerationLevel,
        accelerationScore,
        deltaRatio,
        signal: `price_acceleration_${accelerationLevel.toLowerCase()}`,
    };
}
