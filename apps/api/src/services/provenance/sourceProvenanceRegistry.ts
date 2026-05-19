import { GovernanceContext, ProvenanceSource } from '../governance/governanceTypes';
import { classifySourceReliability } from './sourceReliabilityClassifier';

export function buildSourceProvenanceRegistry(context: GovernanceContext): ProvenanceSource[] {
  const freshnessDays = context.freshnessScore !== undefined ? Math.max(1, Math.round((100 - context.freshnessScore) / 4)) : 90;

  const registry: ProvenanceSource[] = [
    {
      key: 'market_comparables',
      label: 'Market comparables',
      reliability: classifySourceReliability({ sourceConfidence: context.sourceConfidence, sourceKey: 'market_comparables' }),
      state: (context.opportunitySignals?.length || 0) > 0 ? 'inferred' : 'estimated',
      freshnessDays,
      available: (context.opportunitySignals?.length || 0) > 0,
      note: 'Derived from comparable pricing signals.',
    },
    {
      key: 'planning_zoning',
      label: 'Planning and zoning evidence',
      reliability: classifySourceReliability({ sourceConfidence: context.sourceConfidence, sourceKey: 'municipality_planning' }),
      state: (context.missingInputs || []).some((x) => x.toLowerCase().includes('zoning')) ? 'unavailable' : 'verified',
      freshnessDays,
      available: !(context.missingInputs || []).some((x) => x.toLowerCase().includes('zoning')),
      note: 'Assessment includes zoning and planning context when provided.',
    },
    {
      key: 'spatial_infrastructure',
      label: 'Spatial and infrastructure context',
      reliability: classifySourceReliability({ sourceConfidence: context.sourceConfidence, sourceKey: 'public_infrastructure' }),
      state: (context.trendSignals?.length || 0) > 0 ? 'inferred' : 'estimated',
      freshnessDays,
      available: (context.trendSignals?.length || 0) > 0,
      note: 'Signals can include transport and district-level proximity indicators.',
    },
  ];

  return registry;
}
