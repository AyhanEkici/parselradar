import { zoningTransitionSimulator } from './zoningTransitionSimulator';
import { infrastructureImpactSimulator } from './infrastructureImpactSimulator';
import { demographicShiftSimulator } from './demographicShiftSimulator';
import { regionalGrowthSimulator } from './regionalGrowthSimulator';

export function strategicOutcomeSimulator(input: { source: string; timestamp: string; freshness: number; confidence: number; governanceState: string; evidenceLineage: unknown[]; zoningSignal: number; infrastructureScore: number; demographicPressure: number; growthSignal: number; }) {
  const zoning = zoningTransitionSimulator(input);
  const infrastructure = infrastructureImpactSimulator(input);
  const demographic = demographicShiftSimulator(input);
  const growth = regionalGrowthSimulator(input);
  const outcomeScore = Math.max(0, Math.min(100, zoning.projectedShift * 0.25 + infrastructure.impactScore * 0.3 + demographic.shiftScore * 0.2 + growth.growthScore * 0.25));
  return {
    source: input.source,
    timestamp: input.timestamp,
    freshness: input.freshness,
    confidence: input.confidence,
    governanceState: input.governanceState,
    evidenceLineage: input.evidenceLineage,
    inferenceLevel: 'inferred',
    executionReadiness: 'PREPARING',
    deterministic: true,
    zoning,
    infrastructure,
    demographic,
    growth,
    outcomeScore,
  };
}
