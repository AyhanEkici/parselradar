export function detectInfrastructureImpact(input: {
  infrastructureScore?: number;
  roadAccessScore?: number;
  strategicLocationSignals?: string[];
}) {
  const base = ((input.infrastructureScore || 0) * 0.7) + ((input.roadAccessScore || 0) * 0.3);
  const strategicLift = Math.min(12, (input.strategicLocationSignals || []).length * 3);
  const infrastructureImpact = Math.max(0, Math.min(100, Math.round(base + strategicLift)));

  const impactLevel = infrastructureImpact >= 75
    ? 'STRONG'
    : infrastructureImpact >= 55
      ? 'MODERATE'
      : 'LIMITED';

  return {
    infrastructureImpact,
    impactLevel,
    signal: `infrastructure_impact_${impactLevel.toLowerCase()}`,
  };
}
