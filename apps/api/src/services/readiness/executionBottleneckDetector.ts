import { buildExecutionInsightBase } from '../execution/executionInsightTypes';

export function executionBottleneckDetector(input: { source: string; timestamp: string; freshness: number; confidence: number; governanceState: string; evidenceLineage: unknown[]; bottlenecks: Array<{ id: string; severity: number }>; }) {
  const bottlenecks = input.bottlenecks || [];
  const bottleneckScore = bottlenecks.reduce((sum, b) => sum + Math.max(0, Math.min(100, b.severity)), 0) / (bottlenecks.length || 1);
  return {
    ...buildExecutionInsightBase({ ...input }),
    bottleneckScore: Math.round(bottleneckScore),
    staleOperationalStateDowngradeVisible: bottlenecks.length > 0,
    bottlenecks,
  };
}
