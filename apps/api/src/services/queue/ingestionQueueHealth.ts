export function ingestionQueueHealth(input: {
  queueDepth: number;
  delayedJobs: number;
  deadLetterCount: number;
}) {
  const score = Math.max(0, Math.min(100, 100 - input.queueDepth * 2 - input.delayedJobs * 3 - input.deadLetterCount * 5));
  return {
    score,
    state: score >= 75 ? 'HEALTHY' : score >= 50 ? 'WATCH' : 'DEGRADED',
  } as const;
}
