export function buildOpportunityBenchmark(input: {
  averageOpportunity: number;
  highRatioPercent: number;
}) {
  const baselineOpportunity = 55;
  const baselineHighRatio = 35;

  return {
    methodology: 'Internal opportunity benchmark calibrated for portfolio pipeline triage.',
    metrics: {
      averageOpportunity: input.averageOpportunity,
      baselineOpportunity,
      opportunityDelta: Number((input.averageOpportunity - baselineOpportunity).toFixed(2)),
      highOpportunityRatioPercent: input.highRatioPercent,
      baselineHighOpportunityRatioPercent: baselineHighRatio,
      highOpportunityDeltaPercent: Number((input.highRatioPercent - baselineHighRatio).toFixed(2)),
    },
  };
}
