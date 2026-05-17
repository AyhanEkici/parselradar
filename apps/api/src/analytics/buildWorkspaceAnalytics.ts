import Organization from '../models/Organization';
import OrganizationMember from '../models/OrganizationMember';
import WorkspacePortfolio from '../models/WorkspacePortfolio';
import WorkspaceWatchlist from '../models/WorkspaceWatchlist';
import SharedAnalysis from '../models/SharedAnalysis';

export async function buildWorkspaceAnalytics() {
  const [organizations, activeMembers, sharedPortfolio, sharedWatchlist, sharedAnalyses] = await Promise.all([
    Organization.countDocuments({ status: 'ACTIVE' }),
    OrganizationMember.countDocuments({ status: 'ACTIVE' }),
    WorkspacePortfolio.countDocuments({}),
    WorkspaceWatchlist.countDocuments({ status: 'ACTIVE' }),
    SharedAnalysis.countDocuments({}),
  ]);

  return {
    organizations,
    activeMembers,
    sharedPortfolio,
    sharedWatchlist,
    sharedAnalyses,
    workspaceState: organizations > 0 ? 'ACTIVE' : 'READY',
  };
}
