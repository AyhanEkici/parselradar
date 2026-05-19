"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectInvestorOpportunity = detectInvestorOpportunity;
const signalThresholds_1 = require("../../config/connectors/signalThresholds");
function detectInvestorOpportunity(input) {
    const base = (input.score || 0) * 0.36 + (input.marketMomentum || 0) * 0.24 + (input.districtHeat || 0) * 0.24;
    const volatilityPenalty = Math.max(0, (input.volatilityIndex || 0) - 52) * 0.35;
    const overpricingPenalty = String(input.overpricingRisk || 'LOW').toUpperCase() === 'HIGH'
        ? 12
        : String(input.overpricingRisk || 'LOW').toUpperCase() === 'MEDIUM'
            ? 6
            : 0;
    const opportunityScore = Math.max(0, Math.min(100, Math.round(base - volatilityPenalty - overpricingPenalty)));
    const investorSignal = opportunityScore >= signalThresholds_1.SIGNAL_THRESHOLDS.investorSignal.bullish
        ? 'BULLISH'
        : opportunityScore >= signalThresholds_1.SIGNAL_THRESHOLDS.investorSignal.neutral
            ? 'WATCH'
            : 'CAUTION';
    return {
        opportunityScore,
        investorSignal,
        signal: `investor_${investorSignal.toLowerCase()}`,
    };
}
