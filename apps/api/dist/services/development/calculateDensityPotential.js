"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDensityPotential = calculateDensityPotential;
const densityRules_1 = require("../../config/development/densityRules");
function calculateDensityPotential(input) {
    const zoning = (input.zoningStatus || '').toLowerCase();
    const area = input.areaM2 || 0;
    const rule = densityRules_1.DENSITY_RULES.find((candidate) => candidate.zoningKeywords.some((keyword) => zoning.includes(keyword))) || densityRules_1.DEFAULT_DENSITY_RULE;
    const signals = [];
    let score = rule.baseScore;
    if (area >= rule.minimumAreaM2) {
        const areaBonus = Math.min(rule.maxAreaBonus, Math.floor((area - rule.minimumAreaM2) / rule.areaScalingStepM2) * 4 + 4);
        score += Math.max(0, areaBonus);
        signals.push('site_area_supports_density');
    }
    else {
        score -= 8;
        signals.push('site_area_limits_density');
    }
    return {
        category: rule.category,
        score: Math.max(0, Math.min(100, Math.round(score))),
        supportingSignals: signals,
    };
}
