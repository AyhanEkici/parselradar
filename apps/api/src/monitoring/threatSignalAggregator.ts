import { ThreatLevel } from '../security/securityTypes';

export function threatSignalAggregator(input: { abuseScore: number; sessionScore: number; exportRiskScore: number }) {
  const compositeScore = input.abuseScore + input.sessionScore + input.exportRiskScore;
  const threatLevel: ThreatLevel =
    compositeScore >= 180 ? 'CRITICAL' :
    compositeScore >= 130 ? 'HIGH' :
    compositeScore >= 80 ? 'ELEVATED' :
    compositeScore >= 30 ? 'LOW' : 'NONE';
  return { compositeScore, threatLevel };
}
