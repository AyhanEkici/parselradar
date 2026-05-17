export function buildSharedWatchlistSummary(input: {
  rows: Array<Record<string, unknown>>;
}) {
  return {
    total: input.rows.length,
    rows: input.rows,
  };
}
