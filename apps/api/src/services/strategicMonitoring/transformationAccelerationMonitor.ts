import { buildInsightBase } from '../autonomy/autonomyInsightTypes';

export function transformationAccelerationMonitor(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  baselineIndex: number;
  currentIndex: number;
}) {
  const base = buildInsightBase(input);
  const delta = (input.currentIndex || 0) - (input.baselineIndex || 0);
  return {
    ...base,
    accelerationDelta: delta,
    accelerationState: delta >= 20 ? 'accelerating' : delta >= 8 ? 'building' : delta <= -8 ? 'slowing' : 'stable',
  };
}
