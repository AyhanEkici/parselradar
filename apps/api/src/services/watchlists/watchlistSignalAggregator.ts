import { buildInsightBase } from '../autonomy/autonomyInsightTypes';

export function watchlistSignalAggregator(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  parcelSignals: string[];
  regionalSignals: string[];
}) {
  const base = buildInsightBase(input);
  const merged = Array.from(new Set([...(input.parcelSignals || []), ...(input.regionalSignals || [])]));
  return { ...base, signalCount: merged.length, signals: merged };
}
