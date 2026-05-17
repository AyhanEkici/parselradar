export function buildGrowthScenario(input: {
  averageOpportunity: number;
  diversificationScore: number;
  confidenceAverage: number;
}) {
  const executionReadiness = Number(((input.diversificationScore * 0.45 + input.confidenceAverage * 0.55)).toFixed(2));
  const projectedOpportunityBand = {
    low: Number(Math.max(0, input.averageOpportunity - 8).toFixed(2)),
    high: Number(Math.min(100, input.averageOpportunity + 10).toFixed(2)),
  };

  return {
    scenario: 'GROWTH',
    executionReadiness,
    projectedOpportunityBand,
    assumptions: [
      'Assumes connector readiness remains stable or improves.',
      'Assumes no external market return data is injected.',
      'Assumes portfolio rotates gradually toward higher internal opportunity signals.',
    ],
  };
}
