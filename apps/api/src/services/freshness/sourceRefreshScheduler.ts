export function sourceRefreshScheduler(input: {
  source: string;
  state: string;
  freshnessScore: number;
  lastRefreshAt?: string | null;
}) {
  if (input.state === 'ACTIVE' && input.freshnessScore >= 80) {
    return { source: input.source, action: 'DEFER', nextRefreshMinutes: 180, reason: 'active_and_fresh' } as const;
  }
  if (input.state === 'ACTIVE' && input.freshnessScore < 80) {
    return { source: input.source, action: 'QUEUE', nextRefreshMinutes: 30, reason: 'active_but_aging' } as const;
  }
  if (input.state === 'RATE_LIMITED') {
    return { source: input.source, action: 'BACKOFF', nextRefreshMinutes: 120, reason: 'rate_limited' } as const;
  }
  return { source: input.source, action: 'MANUAL_REVIEW', nextRefreshMinutes: 0, reason: `state_${String(input.state).toLowerCase()}` } as const;
}
