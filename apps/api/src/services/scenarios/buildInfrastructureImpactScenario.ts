export function buildInfrastructureImpactScenario(input: {
  averageOpportunity: number;
  connectorLiveRatioPercent: number;
}) {
  const signalStrength = Number(((input.averageOpportunity * 0.55 + input.connectorLiveRatioPercent * 0.45)).toFixed(2));

  return {
    scenario: 'INFRASTRUCTURE_IMPACT',
    signalStrength,
    expectedImpactBand: {
      low: Number(Math.max(0, signalStrength - 12).toFixed(2)),
      high: Number(Math.min(100, signalStrength + 9).toFixed(2)),
    },
    note: 'Impact is based on internal infrastructure-related analysis signals, not guaranteed value uplift.',
  };
}
