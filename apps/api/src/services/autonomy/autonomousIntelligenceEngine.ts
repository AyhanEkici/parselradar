import { AutonomyState, buildInsightBase } from './autonomyInsightTypes';

export function autonomousIntelligenceEngine(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  queueDepth: number;
  restricted: boolean;
}) {
  const base = buildInsightBase(input);
  const state: AutonomyState =
    input.restricted || input.governanceState !== 'ALLOW'
      ? 'RESTRICTED'
      : input.queueDepth <= 2 && input.confidence >= 75
        ? 'GOVERNED_AUTONOMOUS'
        : input.queueDepth <= 6
          ? 'ASSISTED'
          : 'MANUAL_ONLY';

  return {
    ...base,
    autonomyState: state,
    reviewable: true,
    noHiddenEscalation: true,
  };
}
