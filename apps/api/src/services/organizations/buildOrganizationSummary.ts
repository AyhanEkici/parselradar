export function buildOrganizationSummary(input: {
  organizationCount: number;
  totalMembers: number;
  totalSharedAnalyses: number;
  totalWorkspacePortfolios: number;
  totalWorkspaceWatchlist: number;
}) {
  return {
    organizationCount: input.organizationCount,
    totalMembers: input.totalMembers,
    totalSharedAnalyses: input.totalSharedAnalyses,
    totalWorkspacePortfolios: input.totalWorkspacePortfolios,
    totalWorkspaceWatchlist: input.totalWorkspaceWatchlist,
    generatedAt: new Date().toISOString(),
  };
}
