import { AnomalyLevel } from './speculativeAnomalyDetector';

export function artificialDemandSpikeDetector(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  evidenceLineage: unknown[];
  governanceState: string;
  demandSeries: number[];
}) {
  const series = input.demandSeries || [];
  const prev = series.length > 1 ? series[series.length - 2] : 0;
  const curr = series.length > 0 ? series[series.length - 1] : 0;
  const ratio = prev <= 0 ? (curr > 0 ? 1 : 0) : (curr - prev) / prev;
  const level: AnomalyLevel = ratio >= 1.2 ? 'CRITICAL' : ratio >= 0.8 ? 'HIGH' : ratio >= 0.45 ? 'MODERATE' : ratio >= 0.2 ? 'LOW' : 'NONE';

  return {
    source: input.source,
    timestamp: input.timestamp,
    freshness: input.freshness,
    confidence: input.confidence,
    evidenceLineage: input.evidenceLineage || [],
    governanceState: input.governanceState,
    level,
    spikeRatio: Number(ratio.toFixed(4)),
    deterministic: true,
  };
}
