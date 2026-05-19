import { buildInsightBase } from '../autonomy/autonomyInsightTypes';

export function regionalCriticalityEngine(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  regionalPressure: number;
  infrastructureStress: number;
}) {
  const base = buildInsightBase(input);
  const criticality = Math.max(0, Math.min(100, input.regionalPressure * 0.6 + input.infrastructureStress * 0.4));
  return {
    ...base,
    criticalityScore: criticality,
    criticalityState: criticality >= 80 ? 'critical' : criticality >= 60 ? 'high' : criticality >= 40 ? 'moderate' : 'low',
  };
}
