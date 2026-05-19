import { AnomalyLevel } from './speculativeAnomalyDetector';

export function inconsistentPlanningSignalDetector(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  evidenceLineage: unknown[];
  governanceState: string;
  planSignals: string[];
}) {
  const signals = input.planSignals || [];
  const hasConflict = signals.includes('upzoning_signal') && signals.includes('downzoning_signal');
  const level: AnomalyLevel = hasConflict ? 'HIGH' : signals.length >= 4 ? 'MODERATE' : signals.length >= 2 ? 'LOW' : 'NONE';

  return {
    source: input.source,
    timestamp: input.timestamp,
    freshness: input.freshness,
    confidence: input.confidence,
    evidenceLineage: input.evidenceLineage || [],
    governanceState: input.governanceState,
    level,
    conflictDetected: hasConflict,
    planSignals: signals,
    deterministic: true,
  };
}
