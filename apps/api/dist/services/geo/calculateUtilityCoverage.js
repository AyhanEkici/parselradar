"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateUtilityCoverage = calculateUtilityCoverage;
const utilityWeights_1 = require("../../config/geo/utilityWeights");
function parseUtility(value) {
    if (!value)
        return 'unknown';
    const normalized = (value || '').trim().toLowerCase();
    if (utilityWeights_1.UTILITY_KEYWORDS.available.some((k) => normalized.includes(k)))
        return 'available';
    if (utilityWeights_1.UTILITY_KEYWORDS.partial.some((k) => normalized.includes(k)))
        return 'partial';
    if (utilityWeights_1.UTILITY_KEYWORDS.unavailable.some((k) => normalized.includes(k)))
        return 'unavailable';
    return 'unknown';
}
function calculateUtilityCoverage(input) {
    const electric = parseUtility(input.electricity);
    const water = parseUtility(input.water);
    const electricityScore = utilityWeights_1.UTILITY_WEIGHTS.electricity[electric === 'available' ? 'available' : electric === 'partial' ? 'partial' : 'unavailable'];
    const waterScore = utilityWeights_1.UTILITY_WEIGHTS.water[water === 'available' ? 'available' : water === 'partial' ? 'partial' : 'unavailable'];
    const gasScore = utilityWeights_1.UTILITY_WEIGHTS.natural_gas.unavailable;
    const internetScore = utilityWeights_1.UTILITY_WEIGHTS.internet_fiber.unavailable;
    const totalScore = Math.round((electricityScore + waterScore + gasScore + internetScore) / 4);
    return {
        electricityScore,
        waterScore,
        gasScore,
        internetScore,
        totalScore,
    };
}
