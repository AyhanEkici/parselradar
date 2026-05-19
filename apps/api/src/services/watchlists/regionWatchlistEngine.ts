import { buildInsightBase, StrategicRegionState } from '../autonomy/autonomyInsightTypes';

export function regionWatchlistEngine(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  regionalScore: number;
}) {
  const base = buildInsightBase(input);
  const state: StrategicRegionState =
    input.regionalScore >= 85 ? 'TRANSFORMATION_ZONE' : input.regionalScore >= 65 ? 'STRATEGIC' : input.regionalScore >= 40 ? 'WATCH' : 'OBSERVE';
  return { ...base, strategicRegionState: state, regionalScore: Math.max(0, Math.min(100, input.regionalScore)) };
}
