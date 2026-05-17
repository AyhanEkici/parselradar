export function buildPortfolioPerformanceSnapshot(input: {
  averageScore: number;
  averageOpportunity: number;
  freshnessScoreAverage: number;
  confidenceAverage: number;
  connectorNetworkState: string;
  coveredItemCount: number;
  totalItemCount: number;
}) {
  const coverageRatio = input.totalItemCount > 0 ? Number((input.coveredItemCount / input.totalItemCount).toFixed(4)) : 0;

  return {
    intelligencePerformance: {
      averageScore: input.averageScore,
      averageOpportunity: input.averageOpportunity,
      freshnessScoreAverage: input.freshnessScoreAverage,
      confidenceAverage: input.confidenceAverage,
      connectorNetworkState: input.connectorNetworkState,
    },
    sourceCoverage: {
      coveredItemCount: input.coveredItemCount,
      totalItemCount: input.totalItemCount,
      coverageRatio,
    },
    generatedAt: new Date().toISOString(),
    note: 'Performance snapshot reflects internal analysis signal quality and coverage only.',
  };
}
