"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRoadAccessScore = calculateRoadAccessScore;
const roadAccessWeights_1 = require("../../config/geo/roadAccessWeights");
function calculateRoadAccessScore(roadAccess) {
    if (!roadAccess)
        return roadAccessWeights_1.ROAD_ACCESS_WEIGHTS.unknown.score;
    const normalized = (roadAccess || '').trim().toLowerCase();
    for (const [key, keywords] of Object.entries(roadAccessWeights_1.ROAD_ACCESS_KEYWORDS)) {
        if (keywords.some((k) => normalized.includes(k))) {
            const weight = roadAccessWeights_1.ROAD_ACCESS_WEIGHTS[key];
            return weight.score;
        }
    }
    return roadAccessWeights_1.ROAD_ACCESS_WEIGHTS.unknown.score;
}
