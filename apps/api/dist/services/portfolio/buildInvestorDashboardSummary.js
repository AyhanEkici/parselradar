"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildInvestorDashboardSummary = buildInvestorDashboardSummary;
function buildInvestorDashboardSummary(input) {
    return {
        savedAnalysesCount: input.savedAnalysesCount,
        watchlistCount: input.watchlistCount,
        portfolioCount: input.portfolioCount,
        averageOpportunityScore: input.averageOpportunityScore,
        staleIntelligenceCount: input.staleIntelligenceCount,
        highPotentialProperties: input.highPotentialProperties,
        generatedAt: new Date().toISOString(),
    };
}
