export function createPortfolioSnapshot(input: {
  portfolio: Record<string, unknown>;
  items: Array<Record<string, unknown>>;
  latestAnalyses: Array<Record<string, unknown>>;
}) {
  return {
    portfolio: input.portfolio,
    itemCount: input.items.length,
    items: input.items,
    latestAnalyses: input.latestAnalyses,
    generatedAt: new Date().toISOString(),
  };
}
