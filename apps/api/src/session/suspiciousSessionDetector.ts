export function suspiciousSessionDetector(input: { ipChanges: number; userAgentChanges: number; failedTokenChecks: number }) {
  const score = input.ipChanges * 30 + input.userAgentChanges * 25 + input.failedTokenChecks * 45;
  return {
    suspicious: score >= 70,
    score,
    reasons: [
      input.ipChanges > 0 ? 'ip_churn' : null,
      input.userAgentChanges > 0 ? 'user_agent_churn' : null,
      input.failedTokenChecks > 0 ? 'token_failures' : null,
    ].filter(Boolean),
  };
}
