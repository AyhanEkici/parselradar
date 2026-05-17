export function calculatePortfolioOpportunityDistribution(input: {
  opportunities: number[];
}) {
  const distribution = {
    high: 0,
    medium: 0,
    low: 0,
    unknown: 0,
  };

  input.opportunities.forEach((score) => {
    if (Number.isNaN(score)) {
      distribution.unknown += 1;
    } else if (score >= 70) {
      distribution.high += 1;
    } else if (score >= 45) {
      distribution.medium += 1;
    } else {
      distribution.low += 1;
    }
  });

  const total = input.opportunities.length || 1;

  return {
    counts: distribution,
    ratios: {
      high: Number(((distribution.high / total) * 100).toFixed(2)),
      medium: Number(((distribution.medium / total) * 100).toFixed(2)),
      low: Number(((distribution.low / total) * 100).toFixed(2)),
      unknown: Number(((distribution.unknown / total) * 100).toFixed(2)),
    },
  };
}
