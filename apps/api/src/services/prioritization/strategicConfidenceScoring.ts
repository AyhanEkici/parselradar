import { buildInsightBase } from '../autonomy/autonomyInsightTypes';

export function strategicConfidenceScoring(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  corroborationCount: number;
}) {
  const derived = Math.max(0, Math.min(100, input.confidence * 0.7 + Math.min(30, input.corroborationCount * 5)));
  return {
    ...buildInsightBase({ ...input, confidence: derived }),
    corroborationCount: input.corroborationCount,
  };
}
