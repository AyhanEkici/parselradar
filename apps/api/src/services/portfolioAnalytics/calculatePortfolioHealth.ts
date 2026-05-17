export function calculatePortfolioHealth(input: {
  diversificationScore: number;
  concentrationIndex: number;
  staleRatioPercent: number;
  averageConfidence: number;
  connectorLiveRatioPercent: number;
}) {
  const concentrationPenalty = Math.min(35, input.concentrationIndex * 0.6);
  const stalePenalty = Math.min(20, input.staleRatioPercent * 0.2);
  const confidenceBonus = Math.min(15, input.averageConfidence * 0.15);
  const connectorBonus = Math.min(15, input.connectorLiveRatioPercent * 0.15);

  const base = input.diversificationScore;
  const score = Math.max(0, Math.min(100, Number((base - concentrationPenalty - stalePenalty + confidenceBonus + connectorBonus).toFixed(2))));

  let status: 'ROBUST' | 'STABLE' | 'WATCHLIST' | 'FRAGILE' = 'FRAGILE';
  if (score >= 80) status = 'ROBUST';
  else if (score >= 65) status = 'STABLE';
  else if (score >= 45) status = 'WATCHLIST';

  return {
    healthScore: score,
    status,
    components: {
      diversificationScore: input.diversificationScore,
      concentrationIndex: input.concentrationIndex,
      staleRatioPercent: input.staleRatioPercent,
      averageConfidence: input.averageConfidence,
      connectorLiveRatioPercent: input.connectorLiveRatioPercent,
    },
    note: 'Health score is an internal intelligence index, not an ROI or market return metric.',
  };
}
