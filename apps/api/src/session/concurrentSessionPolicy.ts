export function concurrentSessionPolicy(input: { activeSessionCount: number; limit?: number }) {
  const limit = input.limit || 5;
  return {
    activeSessionCount: input.activeSessionCount,
    limit,
    allow: input.activeSessionCount <= limit,
    requiresReview: input.activeSessionCount > limit,
  };
}
