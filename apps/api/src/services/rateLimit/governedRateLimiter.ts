export function governedRateLimiter(input: {
  connectorKey: string;
  attemptsInWindow: number;
  maxPerWindow: number;
}) {
  const limited = input.attemptsInWindow >= input.maxPerWindow;
  return {
    connectorKey: input.connectorKey,
    limited,
    state: limited ? 'RATE_LIMITED' : 'ALLOW',
    remaining: Math.max(0, input.maxPerWindow - input.attemptsInWindow),
  };
}
