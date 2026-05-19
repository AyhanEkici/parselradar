import { buildExecutionInsightBase } from '../execution/executionInsightTypes';

export function multiRegionStrategyEngine(input: {
  source: string; timestamp: string; freshness: number; confidence: number; governanceState: string; evidenceLineage: unknown[];
  regions: Array<{ name: string; score: number }>;
}) {
  const regions = (input.regions || []).slice().sort((a, b) => b.score - a.score);
  return {
    ...buildExecutionInsightBase({ ...input }),
    regions,
    primaryRegion: regions[0]?.name || 'unknown',
  };
}
