import { buildInsightBase } from '../autonomy/autonomyInsightTypes';

export function strategicTransformationRadar(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  transformationIndicators: string[];
}) {
  const base = buildInsightBase(input);
  return {
    ...base,
    transformationIndicators: input.transformationIndicators || [],
    index: Math.min(100, (input.transformationIndicators || []).length * 18),
  };
}
