import { ThreatLevel } from '../security/securityTypes';

export function securityOperationsEngine(input: { threatSignals: number; blockedEvents: number; suspiciousSessions: number }) {
  const score = input.threatSignals * 20 + input.blockedEvents * 15 + input.suspiciousSessions * 10;
  const threatLevel: ThreatLevel =
    score >= 120 ? 'CRITICAL' :
    score >= 90 ? 'HIGH' :
    score >= 60 ? 'ELEVATED' :
    score >= 25 ? 'LOW' : 'NONE';

  return {
    score,
    threatLevel,
    actionsRequired: threatLevel === 'HIGH' || threatLevel === 'CRITICAL',
  };
}
