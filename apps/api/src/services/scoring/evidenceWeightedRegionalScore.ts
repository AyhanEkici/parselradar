export function evidenceWeightedRegionalScore(input: {
  strategicRegionScore?: number;
  developmentProbabilityScore?: number;
  liquidityScore?: number;
  speculativeHeat?: number;
}) {
  const strategic = Number(input.strategicRegionScore || 0);
  const development = Number(input.developmentProbabilityScore || 0);
  const liquidity = Number(input.liquidityScore || 0);
  const speculative = Number(input.speculativeHeat || 0);
  const score = Math.max(0, Math.min(100, Math.round(strategic * 0.35 + development * 0.3 + liquidity * 0.25 - speculative * 0.2)));
  return {
    score,
    method: 'deterministic_evidence_weighted',
    notes: ['Score penalizes speculative heat and favors multi-source alignment.'],
  };
}
