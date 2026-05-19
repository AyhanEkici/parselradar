import { buildInsightBase, StrategicRegionState } from '../autonomy/autonomyInsightTypes';

export function strategicRegionMonitor(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  strategicScore: number;
}) {
  const base = buildInsightBase(input);
  const score = Math.max(0, Math.min(100, input.strategicScore));
  const strategicRegionState: StrategicRegionState =
    score >= 85 ? 'TRANSFORMATION_ZONE' : score >= 65 ? 'STRATEGIC' : score >= 40 ? 'WATCH' : 'OBSERVE';
  return {
    ...base,
    strategicScore: score,
    strategicRegionState,
  };
}
