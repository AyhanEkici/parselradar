export function calculatePortfolioBenchmark(input: {
  averageOpportunityScore: number;
  averageScore: number;
  benchmarkOpportunity: number;
  benchmarkScore: number;
}) {
  const opportunityDelta = Number((input.averageOpportunityScore - input.benchmarkOpportunity).toFixed(2));
  const scoreDelta = Number((input.averageScore - input.benchmarkScore).toFixed(2));

  return {
    averageOpportunityScore: input.averageOpportunityScore,
    benchmarkOpportunity: input.benchmarkOpportunity,
    opportunityDelta,
    averageScore: input.averageScore,
    benchmarkScore: input.benchmarkScore,
    scoreDelta,
    signal: opportunityDelta >= 0 && scoreDelta >= 0 ? 'OUTPERFORMING_INTERNAL_BASELINE' : 'UNDER_INTERNAL_BASELINE',
    methodology: 'Internal portfolio intelligence benchmark derived from available analysis signals only.',
  };
}
