import { IntelligenceSignal, RegionalOutlook } from '../intelligence/intelligenceTypes';

export function regionalGrowthEngine(input: { opportunityScore?: number; marketMomentum?: number; freshnessScore?: number }): IntelligenceSignal<RegionalOutlook> {
  const opp = Number(input.opportunityScore || 0);
  const momentum = Number(input.marketMomentum || 0);
  const freshness = Number(input.freshnessScore || 0);
  const composite = opp * 0.45 + momentum * 0.4 + freshness * 0.15;
  const value: RegionalOutlook = composite >= 78 ? 'ACCELERATING' : composite >= 58 ? 'DEVELOPING' : composite >= 36 ? 'STABLE' : 'DECLINING';
  return {
    value,
    source: 'analysis.fullAnalysis (deterministic composite)',
    freshnessDays: Math.max(1, Math.round((100 - freshness) / 4) || 45),
    confidence: Math.max(20, Math.min(95, Math.round(freshness * 0.5 + 30))),
    inferenceLevel: freshness >= 75 ? 'verified' : freshness >= 50 ? 'inferred' : 'estimated',
    notes: ['Combines opportunity, momentum, and freshness into macro growth direction.'],
  };
}
