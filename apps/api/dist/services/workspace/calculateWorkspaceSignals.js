"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateWorkspaceSignals = calculateWorkspaceSignals;
function calculateWorkspaceSignals(input) {
    if (input.sharedAnalyses.length === 0) {
        return {
            averageScore: 0,
            averageOpportunity: 0,
            staleCount: 0,
            highPotentialCount: 0,
        };
    }
    const totals = input.sharedAnalyses.reduce((acc, row) => {
        acc.score += row.score || 0;
        acc.opportunity += row.opportunityScore || 0;
        if ((row.freshnessScore || 0) < 55)
            acc.stale += 1;
        if ((row.opportunityScore || 0) >= 70)
            acc.highPotential += 1;
        return acc;
    }, { score: 0, opportunity: 0, stale: 0, highPotential: 0 });
    return {
        averageScore: Number((totals.score / input.sharedAnalyses.length).toFixed(2)),
        averageOpportunity: Number((totals.opportunity / input.sharedAnalyses.length).toFixed(2)),
        staleCount: totals.stale,
        highPotentialCount: totals.highPotential,
    };
}
