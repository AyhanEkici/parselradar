export function buildWorkspaceActivityFeed(input: {
  activities: Array<Record<string, unknown>>;
}) {
  return {
    count: input.activities.length,
    items: input.activities,
    generatedAt: new Date().toISOString(),
  };
}
