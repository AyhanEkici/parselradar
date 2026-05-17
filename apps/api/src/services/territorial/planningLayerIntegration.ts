import { NormalizedPlanningPayload } from '../planning/planningPayloadNormalizer';

export type TerritorialPlanningSignal = {
  key: string;
  label: string;
  value: unknown;
  note: string;
};

/**
 * V23 additive interface: converts normalized planning payload into safe territorial signals.
 * This module does not assert guaranteed zoning outcomes.
 */
export function buildTerritorialPlanningSignals(normalized: NormalizedPlanningPayload): TerritorialPlanningSignal[] {
  const availableLayers = normalized.planningLayers.filter((l) => l.available).map((l) => l.scale);
  return [
    {
      key: 'planning_layer_availability',
      label: 'Planning layer availability',
      value: availableLayers,
      note: 'Availability signals only; human review advised for jurisdiction-specific interpretation.',
    },
    {
      key: 'development_pressure_confidence',
      label: 'Development-pressure confidence',
      value: normalized.humanReviewRequired ? 'LOW_TO_MEDIUM' : 'MEDIUM',
      note: 'Heuristic indicator derived from planning layer coverage; not a guarantee.',
    },
  ];
}

