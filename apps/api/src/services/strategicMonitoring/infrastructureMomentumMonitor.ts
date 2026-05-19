import { buildInsightBase } from '../autonomy/autonomyInsightTypes';

export function infrastructureMomentumMonitor(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  projectActivation: number;
  fundingMomentum: number;
}) {
  const base = buildInsightBase(input);
  const momentum = Math.max(0, Math.min(100, input.projectActivation * 0.5 + input.fundingMomentum * 0.5));
  return {
    ...base,
    momentumScore: momentum,
    momentumState: momentum >= 80 ? 'surging' : momentum >= 60 ? 'growing' : momentum >= 40 ? 'steady' : 'weak',
  };
}
