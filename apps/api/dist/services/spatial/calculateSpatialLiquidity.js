"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateSpatialLiquidity = calculateSpatialLiquidity;
function calculateSpatialLiquidity(input) {
    let score = input.clusterStrength * 0.52 + Math.min(input.comparableCount, 12) * 3;
    if ((input.roadDistanceKm ?? 99) <= 6)
        score += 12;
    else if ((input.roadDistanceKm ?? 99) <= 12)
        score += 6;
    if ((input.municipalityDistanceKm ?? 99) <= 10)
        score += 10;
    else if ((input.municipalityDistanceKm ?? 99) <= 20)
        score += 4;
    const bounded = Math.max(0, Math.min(100, Math.round(score)));
    return {
        score: bounded,
        label: bounded >= 72 ? 'liquid' : bounded >= 48 ? 'balanced' : 'thin',
    };
}
