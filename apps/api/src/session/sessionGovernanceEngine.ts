import { SessionTrust } from '../security/securityTypes';

export function sessionGovernanceEngine(input: { integrityValid: boolean; suspiciousSignals: number; concurrentSessions: number }) {
  const sessionTrust: SessionTrust =
    !input.integrityValid ? 'BLOCKED' :
    input.suspiciousSignals >= 3 ? 'SUSPICIOUS' :
    'VERIFIED';

  return {
    sessionTrust,
    concurrentSessions: input.concurrentSessions,
    requiresStepUp: sessionTrust === 'SUSPICIOUS' || input.concurrentSessions > 5,
    deterministic: true,
  };
}
