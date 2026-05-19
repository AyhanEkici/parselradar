"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateSubdivisionPotential = calculateSubdivisionPotential;
const developerThresholds_1 = require("../../config/development/developerThresholds");
function calculateSubdivisionPotential(input) {
    const area = input.areaM2 || 0;
    const zoning = (input.zoningStatus || '').toLowerCase();
    const road = (input.roadAccess || '').toLowerCase();
    let score = 28;
    const signals = [];
    if (area >= developerThresholds_1.SUBDIVISION_THRESHOLDS.high) {
        score += 40;
        signals.push('large_parcel_threshold');
    }
    else if (area >= developerThresholds_1.SUBDIVISION_THRESHOLDS.medium) {
        score += 26;
        signals.push('medium_parcel_threshold');
    }
    else if (area >= developerThresholds_1.SUBDIVISION_THRESHOLDS.low) {
        score += 14;
        signals.push('minimum_split_threshold');
    }
    if (zoning.includes('konut') || zoning.includes('commercial') || zoning.includes('ticari')) {
        score += 12;
        signals.push('flexible_zoning_pattern');
    }
    if (road.includes('highway') || road.includes('anayol') || road.includes('cadde')) {
        score += 10;
        signals.push('road_frontage_support');
    }
    const level = score >= 75 ? 'high' : score >= 52 ? 'medium' : 'low';
    return {
        level,
        score: Math.max(0, Math.min(100, score)),
        splitabilitySignals: signals,
    };
}
