"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateInfrastructureScore = calculateInfrastructureScore;
const calculateRoadAccessScore_1 = require("./calculateRoadAccessScore");
const calculateUtilityCoverage_1 = require("./calculateUtilityCoverage");
function calculateInfrastructureScore(input) {
    const roadScore = (0, calculateRoadAccessScore_1.calculateRoadAccessScore)(input.roadAccess);
    const utilities = (0, calculateUtilityCoverage_1.calculateUtilityCoverage)({
        electricity: input.electricity,
        water: input.water,
    });
    const areaBonus = typeof input.areaM2 === 'number' && input.areaM2 >= 1000 ? 8 : 0;
    const score = Math.round(roadScore * 0.4 + utilities.totalScore * 0.45 + areaBonus * 0.15);
    return Math.max(0, Math.min(100, score));
}
