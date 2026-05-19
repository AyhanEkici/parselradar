import { buildInsightBase, StrategicRegionState } from '../autonomy/autonomyInsightTypes';

export function strategicWatchClassifier(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  transformationScore: number;
}) {
  const base = buildInsightBase(input);
  const state: StrategicRegionState =
    input.transformationScore >= 85 ? 'TRANSFORMATION_ZONE' : input.transformationScore >= 65 ? 'STRATEGIC' : input.transformationScore >= 40 ? 'WATCH' : 'OBSERVE';
  return { ...base, state, transformationScore: Math.max(0, Math.min(100, input.transformationScore)) };
}
