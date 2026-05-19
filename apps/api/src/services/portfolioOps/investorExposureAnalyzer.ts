import { buildInsightBase, PortfolioExposure } from '../autonomy/autonomyInsightTypes';

export function investorExposureAnalyzer(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  exposureScore: number;
}) {
  const base = buildInsightBase(input);
  const s = Math.max(0, Math.min(100, input.exposureScore));
  const exposure: PortfolioExposure = s >= 82 ? 'CONCENTRATED' : s >= 65 ? 'HIGH_RISK' : s >= 40 ? 'MODERATE_RISK' : 'LOW_RISK';
  return { ...base, exposure, exposureScore: s };
}
