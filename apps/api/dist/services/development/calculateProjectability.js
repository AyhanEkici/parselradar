"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateProjectability = calculateProjectability;
const developerThresholds_1 = require("../../config/development/developerThresholds");
function calculateProjectability(input) {
    const blockers = [];
    let score = input.densityScore * 0.24 + (input.infrastructureScore || 0) * 0.18 + (input.roadAccessScore || 0) * 0.16 + input.frontageDepthScore * 0.18 + input.subdivisionScore * 0.12 + input.rezoningScore * 0.12;
    if ((input.infrastructureScore || 0) < 45)
        blockers.push('infrastructure_constraint');
    if ((input.roadAccessScore || 0) < 45)
        blockers.push('access_constraint');
    if (input.frontageDepthScore < 48)
        blockers.push('geometry_constraint');
    if (input.densityScore < 52)
        blockers.push('density_constraint');
    score -= blockers.length * 4;
    const bounded = Math.max(0, Math.min(100, Math.round(score)));
    const level = bounded >= developerThresholds_1.PROJECTABILITY_THRESHOLDS.easy ? 'easy' : bounded >= developerThresholds_1.PROJECTABILITY_THRESHOLDS.moderate ? 'moderate' : 'difficult';
    return {
        score: bounded,
        level,
        blockers,
    };
}
