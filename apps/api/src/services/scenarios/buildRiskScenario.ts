export function buildRiskScenario(input: {
  concentrationIndex: number;
  staleRatioPercent: number;
  connectorNetworkState: string;
}) {
  const networkPenalty = input.connectorNetworkState === 'degraded' ? 18 : input.connectorNetworkState === 'stale' ? 10 : 4;
  const riskPressureIndex = Number((input.concentrationIndex * 0.6 + input.staleRatioPercent * 0.25 + networkPenalty).toFixed(2));

  return {
    scenario: 'RISK',
    riskPressureIndex,
    observations: {
      concentrationIndex: input.concentrationIndex,
      staleRatioPercent: input.staleRatioPercent,
      connectorNetworkState: input.connectorNetworkState,
    },
    interpretation: riskPressureIndex >= 60 ? 'HIGH_PRESSURE' : riskPressureIndex >= 40 ? 'ELEVATED' : 'MANAGEABLE',
  };
}
