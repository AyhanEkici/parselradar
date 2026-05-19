import { buildInsightBase } from '../autonomy/autonomyInsightTypes';

export function regionalSurveillanceEngine(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  corridorGrowth: number;
  municipalMomentum: number;
}) {
  const base = buildInsightBase(input);
  const surveillanceScore = Math.max(0, Math.min(100, input.corridorGrowth * 0.55 + input.municipalMomentum * 0.45));
  return {
    ...base,
    surveillanceScore,
    surveillanceState: surveillanceScore >= 80 ? 'high' : surveillanceScore >= 55 ? 'active' : 'observe',
  };
}
