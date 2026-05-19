"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMacroStressScenario = buildMacroStressScenario;
function buildMacroStressScenario(input) {
    const stressVulnerability = Number((input.concentrationIndex * 0.55 + (100 - input.confidenceAverage) * 0.25 + (100 - input.freshnessScoreAverage) * 0.2).toFixed(2));
    return {
        scenario: 'MACRO_STRESS',
        stressVulnerability,
        resilienceIndex: Number((100 - stressVulnerability).toFixed(2)),
        interpretation: stressVulnerability >= 65 ? 'STRESS_SENSITIVE' : stressVulnerability >= 45 ? 'MODERATE_SENSITIVITY' : 'RELATIVELY_RESILIENT',
        note: 'Macro stress scenario is a portfolio-internal stress proxy, not a market forecast.',
    };
}
