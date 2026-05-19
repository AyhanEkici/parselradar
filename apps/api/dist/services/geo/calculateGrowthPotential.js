"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateGrowthPotential = calculateGrowthPotential;
const developmentZones_1 = require("../../config/geo/developmentZones");
function normalize(value) {
    return (value || '').trim().toLowerCase();
}
function calculateGrowthPotential(city, district) {
    const normalizedCity = normalize(city);
    const normalizedDistrict = normalize(district);
    const zone = developmentZones_1.DEVELOPMENT_ZONES.find((z) => normalize(z.city) === normalizedCity && (!z.district || normalize(z.district) === normalizedDistrict));
    if (!zone) {
        return {
            growthScore: 55,
            developmentPhase: 'mature',
            growthIndicators: 60,
        };
    }
    const growthScore = developmentZones_1.DEVELOPMENT_PHASE_SCORES[zone.developmentPhase];
    return {
        growthScore,
        developmentPhase: zone.developmentPhase,
        growthIndicators: zone.growthIndicators,
    };
}
