"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulateRezoningUpside = simulateRezoningUpside;
const zoningScenarioWeights_1 = require("../../config/development/zoningScenarioWeights");
function resolveScenario(zoningStatus) {
    const zoning = (zoningStatus || '').toLowerCase();
    if (zoningScenarioWeights_1.ZONING_UPSIDE_KEYWORDS.infrastructure_linked.some((keyword) => zoning.includes(keyword)))
        return 'infrastructure_linked';
    if (zoningScenarioWeights_1.ZONING_UPSIDE_KEYWORDS.speculative_upside.some((keyword) => zoning.includes(keyword)))
        return 'speculative_upside';
    if (zoningScenarioWeights_1.ZONING_UPSIDE_KEYWORDS.moderate_upside.some((keyword) => zoning.includes(keyword)))
        return 'moderate_upside';
    return 'stable';
}
function simulateRezoningUpside(input) {
    const scenario = resolveScenario(input.zoningStatus);
    const config = zoningScenarioWeights_1.ZONING_SCENARIO_WEIGHTS[scenario];
    const score = config.baseScore + (input.infrastructureScore || 0) * config.infraMultiplier + (input.demandScore || 0) * config.demandMultiplier + (input.roadAccessScore || 0) * config.roadMultiplier;
    const signals = [];
    if ((input.infrastructureScore || 0) >= 70)
        signals.push('infrastructure_supports_upside');
    if ((input.demandScore || 0) >= 75)
        signals.push('regional_demand_supports_repositioning');
    if ((input.roadAccessScore || 0) >= 70)
        signals.push('access_supports_intensification');
    return {
        score: Math.max(0, Math.min(100, Math.round(score))),
        scenario,
        signals,
    };
}
