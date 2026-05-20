import { ThreatLevel } from '../security/securityTypes';

export function suspiciousActivityScorer(input: { anomalyScore: number; bruteForceBlocked: boolean; tokenFailures: number }) {
  const score = input.anomalyScore + (input.bruteForceBlocked ? 40 : 0) + input.tokenFailures * 15;
  const threatLevel: ThreatLevel =
    score >= 140 ? 'CRITICAL' :
    score >= 100 ? 'HIGH' :
    score >= 70 ? 'ELEVATED' :
    score >= 35 ? 'LOW' : 'NONE';

  return { score, threatLevel };
}
