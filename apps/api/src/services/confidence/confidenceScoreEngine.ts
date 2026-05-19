import { ConfidenceClass } from '../governance/governanceTypes';

export function buildConfidenceScore(input: {
  baseConfidence: number;
  signalWeightScore: number;
  penalty: number;
  freshnessScore: number;
}): { score: number; classification: ConfidenceClass } {
  const raw = input.baseConfidence * 0.5 + input.signalWeightScore * 0.25 + input.freshnessScore * 0.25 - input.penalty;
  const score = Math.max(0, Math.min(100, Math.round(raw)));

  let classification: ConfidenceClass = 'LOW';
  if (score >= 85) classification = 'VERY_HIGH';
  else if (score >= 70) classification = 'HIGH';
  else if (score >= 45) classification = 'MODERATE';

  return { score, classification };
}
