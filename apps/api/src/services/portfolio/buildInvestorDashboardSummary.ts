export function buildInvestorDashboardSummary(input: {
  savedAnalysesCount: number;
  watchlistCount: number;
  portfolioCount: number;
  averageOpportunityScore: number;
  staleIntelligenceCount: number;
  highPotentialProperties: number;
}) {
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
