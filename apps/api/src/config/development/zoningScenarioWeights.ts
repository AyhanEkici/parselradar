export const ZONING_SCENARIO_WEIGHTS = {
  stable: {
    weight: 1.0,
    label: 'Stable zoning',
    description: 'Current zoning unlikely to change',
    upholdProbability: 0.95,
  },
  moderate_upside: {
    weight: 1.35,
    label: 'Moderate rezoning upside',
    description: 'Incremental density increase likely',
    upholdProbability: 0.65,
  },
  speculative_upside: {
    weight: 1.8,
    label: 'Speculative rezoning',
    description: 'Significant zoning change possible',
    upholdProbability: 0.35,
  },
  infrastructure_linked: {
    weight: 1.6,
    label: 'Infrastructure-linked upside',
    description: 'Rezoning tied to regional infrastructure',
    upholdProbability: 0.55,
  },
} as const;

export const REZONING_DISTRICT_SIGNALS = {
  emerging: { rezoneWeight: 1.8, label: 'Emerging zone high rezoning potential' },
  developing: { rezoneWeight: 1.5, label: 'Developing zone moderate rezoning' },
  mature: { rezoneWeight: 1.1, label: 'Mature zone low rezoning probability' },
  saturated: { rezoneWeight: 1.0, label: 'Saturated zone rezoning unlikely' },
} as const;
