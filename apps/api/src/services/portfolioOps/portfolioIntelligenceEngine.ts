import { PortfolioExposure, buildInsightBase } from '../autonomy/autonomyInsightTypes';

export function portfolioIntelligenceEngine(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  concentrationScore: number;
  volatilityScore: number;
}) {
  const base = buildInsightBase(input);
  const score = Math.max(0, Math.min(100, input.concentrationScore * 0.55 + input.volatilityScore * 0.45));
  const exposure: PortfolioExposure = score >= 82 ? 'CONCENTRATED' : score >= 65 ? 'HIGH_RISK' : score >= 40 ? 'MODERATE_RISK' : 'LOW_RISK';
  return { ...base, portfolioExposure: exposure, score };
}
