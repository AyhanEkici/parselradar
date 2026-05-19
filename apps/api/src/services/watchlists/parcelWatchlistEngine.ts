import { buildInsightBase } from '../autonomy/autonomyInsightTypes';

export function parcelWatchlistEngine(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  parcelSignals: string[];
}) {
  const base = buildInsightBase(input);
  return {
    ...base,
    watchState: input.parcelSignals.length >= 4 ? 'CRITICAL' : input.parcelSignals.length >= 2 ? 'HIGH' : input.parcelSignals.length >= 1 ? 'MEDIUM' : 'LOW',
    parcelSignals: input.parcelSignals || [],
  };
}
