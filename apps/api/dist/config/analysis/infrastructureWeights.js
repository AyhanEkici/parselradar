"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROAD_PROXIMITY_SCORES = exports.ROAD_PROXIMITY_KEYWORDS = exports.INFRASTRUCTURE_SCORE_COMPONENTS = exports.INFRASTRUCTURE_WEIGHTS = void 0;
exports.INFRASTRUCTURE_WEIGHTS = {
    roadAccess: 0.42,
    electricity: 0.3,
    water: 0.28,
};
exports.INFRASTRUCTURE_SCORE_COMPONENTS = {
    baseScore: 35,
    roadPositive: 25,
    electricityPositive: 20,
    waterPositive: 20,
    missingPenalty: 12,
};
exports.ROAD_PROXIMITY_KEYWORDS = {
    strong: ['anayol', 'main road', 'boulevard', 'highway', 'otoyol', 'arter'],
    medium: ['yol', 'road', 'street', 'cadde', 'sokak'],
    weak: ['no', 'none', 'yok', 'uzak', 'far'],
};
exports.ROAD_PROXIMITY_SCORES = {
    strong: 90,
    medium: 72,
    weak: 35,
    unknown: 50,
};
