"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePortfolioOpportunityScore = calculatePortfolioOpportunityScore;
function calculatePortfolioOpportunityScore(input) {
    if (input.analyses.length === 0) {
        return {
            averageScore: 0,
            averageOpportunity: 0,
            staleIntelligenceCount: 0,
            highPotentialCount: 0,
        };
    }
    const totals = input.analyses.reduce((acc, item) => {
        acc.score += item.score || 0;
        acc.opportunity += item.opportunityScore || 0;
        if ((item.freshnessScore || 0) < 55)
            acc.stale += 1;
        if ((item.opportunityScore || 0) >= 70)
            acc.highPotential += 1;
        return acc;
    }, { score: 0, opportunity: 0, stale: 0, highPotential: 0 });
    return {
        averageScore: Number((totals.score / input.analyses.length).toFixed(2)),
        averageOpportunity: Number((totals.opportunity / input.analyses.length).toFixed(2)),
        staleIntelligenceCount: totals.stale,
        highPotentialCount: totals.highPotential,
    };
}
