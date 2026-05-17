export type DevelopmentScenarioTimelineItem = {
  phase: 'land_control' | 'scheme_test' | 'entitlement_watch' | 'delivery_readiness';
  title: string;
  detail: string;
};

export function buildDevelopmentScenario(input: {
  subdivisionLevel: 'low' | 'medium' | 'high';
  densityCategory: 'low_rise' | 'mid_rise' | 'mixed_use' | 'industrial' | 'tourism';
  roiScenario: 'conservative' | 'moderate' | 'aggressive';
  rezoningScenario: 'stable' | 'moderate_upside' | 'speculative_upside' | 'infrastructure_linked';
  projectabilityLevel: 'easy' | 'moderate' | 'difficult';
}): DevelopmentScenarioTimelineItem[] {
  return [
    {
      phase: 'land_control',
      title: input.subdivisionLevel === 'high' ? 'Test subdivision-led land plan' : 'Secure coherent site control',
      detail: input.subdivisionLevel === 'high' ? 'Parcel scale supports splitability heuristics; test phased release and frontage retention.' : 'Prioritize a single executable control plan before adding optional phases.',
    },
    {
      phase: 'scheme_test',
      title: `Model ${input.densityCategory.replace(/_/g, ' ')} development envelope`,
      detail: `Current density signal points to a ${input.densityCategory.replace(/_/g, ' ')} scenario with ${input.roiScenario} developer upside.` ,
    },
    {
      phase: 'entitlement_watch',
      title: `Monitor ${input.rezoningScenario.replace(/_/g, ' ')} zoning path`,
      detail: input.rezoningScenario === 'stable' ? 'Base case assumes zoning remains substantially intact.' : 'Value capture depends on monitored entitlement or corridor-driven repositioning.',
    },
    {
      phase: 'delivery_readiness',
      title: `Projectability is ${input.projectabilityLevel}`,
      detail: input.projectabilityLevel === 'easy' ? 'Existing geometry, access, and infrastructure support a quicker developer path.' : 'Pre-development friction remains material; sequence diligence around blockers.',
    },
  ];
}
