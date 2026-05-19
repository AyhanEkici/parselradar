"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDeveloperFit = calculateDeveloperFit;
const infrastructureWeights_1 = require("../../config/analysis/infrastructureWeights");
const zoningWeights_1 = require("../../config/analysis/zoningWeights");
function normalize(value) {
    return (value || '').trim().toLowerCase();
}
function hasNegativeUtility(value) {
    const v = normalize(value);
    return v.includes('no') || v.includes('none') || v.includes('yok');
}
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function resolveZoningProfile(zoningStatus) {
    const zoning = normalize(zoningStatus);
    const found = Object.entries(zoningWeights_1.ZONING_WEIGHTS).find(([key]) => zoning.includes(key));
    return found ? found[1] : zoningWeights_1.DEFAULT_ZONING_PROFILE;
}
function roadProximityScore(value) {
    const v = normalize(value);
    if (!v)
        return infrastructureWeights_1.ROAD_PROXIMITY_SCORES.unknown;
    if (infrastructureWeights_1.ROAD_PROXIMITY_KEYWORDS.strong.some((k) => v.includes(k)))
        return infrastructureWeights_1.ROAD_PROXIMITY_SCORES.strong;
    if (infrastructureWeights_1.ROAD_PROXIMITY_KEYWORDS.medium.some((k) => v.includes(k)))
        return infrastructureWeights_1.ROAD_PROXIMITY_SCORES.medium;
    if (infrastructureWeights_1.ROAD_PROXIMITY_KEYWORDS.weak.some((k) => v.includes(k)))
        return infrastructureWeights_1.ROAD_PROXIMITY_SCORES.weak;
    return infrastructureWeights_1.ROAD_PROXIMITY_SCORES.unknown;
}
function calculateDeveloperFit(input) {
    const zoningProfile = resolveZoningProfile(input.zoningStatus);
    const zoningPotentialScore = zoningProfile.zoningPotentialScore;
    let parcelReadinessScore = 20;
    if (input.ada)
        parcelReadinessScore += 25;
    if (input.parsel)
        parcelReadinessScore += 30;
    if (input.pafta)
        parcelReadinessScore += 10;
    if (input.tapuType && normalize(input.tapuType) !== 'unknown')
        parcelReadinessScore += 15;
    const roadScore = roadProximityScore(input.roadAccess);
    const electricityScore = hasNegativeUtility(input.electricity)
        ? infrastructureWeights_1.INFRASTRUCTURE_SCORE_COMPONENTS.baseScore - infrastructureWeights_1.INFRASTRUCTURE_SCORE_COMPONENTS.missingPenalty
        : infrastructureWeights_1.INFRASTRUCTURE_SCORE_COMPONENTS.baseScore + infrastructureWeights_1.INFRASTRUCTURE_SCORE_COMPONENTS.electricityPositive;
    const waterScore = hasNegativeUtility(input.water)
        ? infrastructureWeights_1.INFRASTRUCTURE_SCORE_COMPONENTS.baseScore - infrastructureWeights_1.INFRASTRUCTURE_SCORE_COMPONENTS.missingPenalty
        : infrastructureWeights_1.INFRASTRUCTURE_SCORE_COMPONENTS.baseScore + infrastructureWeights_1.INFRASTRUCTURE_SCORE_COMPONENTS.waterPositive;
    const infraScore = clamp(Math.round(roadScore * infrastructureWeights_1.INFRASTRUCTURE_WEIGHTS.roadAccess +
        electricityScore * infrastructureWeights_1.INFRASTRUCTURE_WEIGHTS.electricity +
        waterScore * infrastructureWeights_1.INFRASTRUCTURE_WEIGHTS.water), 0, 100);
    let sizeScore = 40;
    if (typeof input.areaM2 === 'number' && input.areaM2 > 0) {
        if (input.areaM2 >= 250 && input.areaM2 <= 20000)
            sizeScore = 85;
        else if (input.areaM2 > 20000 && input.areaM2 <= 50000)
            sizeScore = 65;
        else if (input.areaM2 < 250)
            sizeScore = 35;
        else
            sizeScore = 50;
    }
    const landUseDesirabilityScore = clamp(Math.round(zoningProfile.desirabilityScore * zoningWeights_1.LAND_USE_DESIRABILITY_WEIGHTS.zoningDesirability +
        infraScore * zoningWeights_1.LAND_USE_DESIRABILITY_WEIGHTS.infrastructureSupport +
        sizeScore * zoningWeights_1.LAND_USE_DESIRABILITY_WEIGHTS.parcelSizeFit), 0, 100);
    const developerFitScore = Math.round(zoningPotentialScore * 0.35 +
        clamp(parcelReadinessScore, 0, 100) * 0.3 +
        clamp(infraScore, 0, 100) * 0.2 +
        landUseDesirabilityScore * 0.15);
    const developerFit = developerFitScore >= 75 ? 'HIGH' : developerFitScore >= 55 ? 'MEDIUM' : 'LOW';
    const zoningPotential = zoningPotentialScore >= 75 ? 'HIGH' : zoningPotentialScore >= 50 ? 'MEDIUM' : 'LOW';
    return {
        developerFitScore: clamp(developerFitScore, 0, 100),
        developerFit,
        zoningPotentialScore: clamp(zoningPotentialScore, 0, 100),
        zoningPotential,
        parcelReadinessScore: clamp(parcelReadinessScore, 0, 100),
    };
}
