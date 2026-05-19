export function ingestionDeadLetterReview(input: {
  deadLetters: Array<{ connectorKey: string; reason: string; createdAt: string }>;
}) {
  return {
    count: input.deadLetters.length,
    latest: input.deadLetters.slice(0, 10),
    requiresReview: input.deadLetters.length > 0,
  };
}
