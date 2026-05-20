export function bruteForceDefense(input: { failedLogins: number; windowMinutes: number }) {
  const blocked = input.failedLogins >= 10;
  return {
    blocked,
    cooldownMinutes: blocked ? Math.min(60, input.failedLogins * 2) : 0,
    reason: blocked ? 'too_many_failed_logins' : 'allowed',
  };
}
