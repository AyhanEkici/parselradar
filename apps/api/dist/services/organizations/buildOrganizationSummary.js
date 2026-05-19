"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildOrganizationSummary = buildOrganizationSummary;
function buildOrganizationSummary(input) {
    return {
        organizationCount: input.organizationCount,
        totalMembers: input.totalMembers,
        totalSharedAnalyses: input.totalSharedAnalyses,
        totalWorkspacePortfolios: input.totalWorkspacePortfolios,
        totalWorkspaceWatchlist: input.totalWorkspaceWatchlist,
        generatedAt: new Date().toISOString(),
    };
}
