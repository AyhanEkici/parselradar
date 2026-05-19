import { buildInsightBase } from '../autonomy/autonomyInsightTypes';

export function portfolioRiskEvolution(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  riskSeries: number[];
}) {
  const base = buildInsightBase(input);
  const series = input.riskSeries || [];
  const delta = (series[series.length - 1] || 0) - (series[0] || 0);
  return { ...base, delta, trend: delta >= 12 ? 'rising' : delta <= -12 ? 'falling' : 'stable', riskSeries: series };
}
