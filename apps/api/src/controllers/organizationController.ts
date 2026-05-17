import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import Organization from '../models/Organization';
import OrganizationMember, { OrganizationRole } from '../models/OrganizationMember';
import Workspace from '../models/Workspace';
import WorkspacePortfolio from '../models/WorkspacePortfolio';
import WorkspaceWatchlist from '../models/WorkspaceWatchlist';
import SharedAnalysis from '../models/SharedAnalysis';
import PropertySubmission from '../models/PropertySubmission';
import { canPerformWorkspaceAction, resolveWorkspacePermissions } from '../services/organizations/resolveWorkspacePermissions';
import { buildOrganizationSummary } from '../services/organizations/buildOrganizationSummary';
import { calculateOrganizationExposure } from '../services/organizations/calculateOrganizationExposure';
import { createOrganizationSnapshot } from '../services/organizations/createOrganizationSnapshot';

function userId(req: AuthRequest) {
  return new mongoose.Types.ObjectId(String(req.user?._id));
}

async function getActiveMembership(organizationId: string, requestUserId: mongoose.Types.ObjectId) {
  return OrganizationMember.findOne({
    organizationId,
    userId: requestUserId,
    status: 'ACTIVE',
  }).lean();
}

export const getOrganizations = async (req: AuthRequest, res: Response) => {
  const requestUserId = userId(req);
  const memberships = await OrganizationMember.find({ userId: requestUserId, status: 'ACTIVE' }).lean();
  const organizationIds = memberships.map((m: any) => m.organizationId);
  const organizations = await Organization.find({ _id: { $in: organizationIds }, status: 'ACTIVE' })
    .sort({ createdAt: -1 })
    .lean();

  const counts = await Promise.all(
    organizations.map(async (org: any) => ({
      organizationId: String(org._id),
      members: await OrganizationMember.countDocuments({ organizationId: org._id, status: 'ACTIVE' }),
      sharedAnalyses: await SharedAnalysis.countDocuments({ organizationId: org._id }),
      sharedPortfolio: await WorkspacePortfolio.countDocuments({ organizationId: org._id }),
      sharedWatchlist: await WorkspaceWatchlist.countDocuments({ organizationId: org._id, status: 'ACTIVE' }),
    }))
  );

  const summary = buildOrganizationSummary({
    organizationCount: organizations.length,
    totalMembers: counts.reduce((sum, row) => sum + row.members, 0),
    totalSharedAnalyses: counts.reduce((sum, row) => sum + row.sharedAnalyses, 0),
    totalWorkspacePortfolios: counts.reduce((sum, row) => sum + row.sharedPortfolio, 0),
    totalWorkspaceWatchlist: counts.reduce((sum, row) => sum + row.sharedWatchlist, 0),
  });

  return res.json({
    organizations: organizations.map((org: any) => {
      const membership = memberships.find((m: any) => String(m.organizationId) === String(org._id));
      const metrics = counts.find((c) => c.organizationId === String(org._id));
      return {
        ...org,
        memberRole: membership?.role,
        memberCount: metrics?.members || 0,
        sharedAnalysesCount: metrics?.sharedAnalyses || 0,
      };
    }),
    summary,
  });
};

export const createOrganization = async (req: AuthRequest, res: Response) => {
  const requestUserId = userId(req);
  const { name } = req.body as { name?: string };
  if (!name) return res.status(400).json({ error: 'name gerekli' });

  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + `-${Date.now()}`;

  const organization = await Organization.create({
    name,
    slug,
    createdByUserId: requestUserId,
    status: 'ACTIVE',
  });

  await OrganizationMember.create({
    organizationId: organization._id,
    userId: requestUserId,
    role: 'OWNER',
    status: 'ACTIVE',
  });

  await Workspace.create({
    organizationId: organization._id,
    name: 'Main Workspace',
    description: 'Default collaborative workspace',
    createdByUserId: requestUserId,
  });

  return res.json(organization);
};

export const getOrganizationById = async (req: AuthRequest, res: Response) => {
  const requestUserId = userId(req);
  const membership = await getActiveMembership(req.params.id, requestUserId);
  if (!membership) return res.status(403).json({ error: 'Organization erişim yetkisi yok' });
  if (!canPerformWorkspaceAction(membership.role, 'organization:read')) {
    return res.status(403).json({ error: 'Bu işlem için yetki yok' });
  }

  const [organization, members, sharedPortfolioRows, sharedWatchlistRows, sharedAnalyses] = await Promise.all([
    Organization.findById(req.params.id).lean(),
    OrganizationMember.find({ organizationId: req.params.id, status: 'ACTIVE' })
      .populate('userId', 'name email role')
      .lean(),
    WorkspacePortfolio.find({ organizationId: req.params.id }).lean(),
    WorkspaceWatchlist.find({ organizationId: req.params.id, status: 'ACTIVE' }).lean(),
    SharedAnalysis.find({ organizationId: req.params.id }).lean(),
  ]);

  if (!organization) return res.status(404).json({ error: 'Organization bulunamadı' });

  const portfolioProperties = await PropertySubmission.find({
    _id: { $in: sharedPortfolioRows.map((row: any) => row.propertySubmissionId) },
  }).lean();

  const watchlistProperties = await PropertySubmission.find({
    _id: { $in: sharedWatchlistRows.map((row: any) => row.propertySubmissionId) },
  }).lean();

  const exposure = calculateOrganizationExposure({
    portfolios: portfolioProperties.map((p: any) => ({ askingPriceTRY: p.askingPriceTRY, il: p.il })),
    watchlist: watchlistProperties.map((p: any) => ({ askingPriceTRY: p.askingPriceTRY })),
  });

  const snapshot = createOrganizationSnapshot({
    organization,
    members: members as Array<Record<string, unknown>>,
    exposure,
  });

  return res.json({
    organization,
    members,
    permissions: resolveWorkspacePermissions(membership.role),
    metrics: {
      sharedPortfolioCount: sharedPortfolioRows.length,
      sharedWatchlistCount: sharedWatchlistRows.length,
      sharedAnalysisCount: sharedAnalyses.length,
    },
    exposure,
    snapshot,
  });
};

export const addOrganizationMember = async (req: AuthRequest, res: Response) => {
  const requestUserId = userId(req);
  const organizationId = req.params.id;

  const membership = await getActiveMembership(organizationId, requestUserId);
  if (!membership) return res.status(403).json({ error: 'Organization erişim yetkisi yok' });
  if (!canPerformWorkspaceAction(membership.role, 'organization:manage-members')) {
    return res.status(403).json({ error: 'Üye yönetme yetkisi yok' });
  }

  const { userId: targetUserId, role } = req.body as { userId?: string; role?: OrganizationRole };
  if (!targetUserId || !role || !mongoose.Types.ObjectId.isValid(targetUserId)) {
    return res.status(400).json({ error: 'Geçersiz userId/role' });
  }

  const doc = await OrganizationMember.findOneAndUpdate(
    { organizationId, userId: targetUserId },
    {
      $set: { role, status: 'ACTIVE' },
      $setOnInsert: { organizationId, userId: targetUserId, invitedByUserId: requestUserId },
    },
    { new: true, upsert: true }
  ).lean();

  return res.json(doc);
};

export const patchOrganizationMember = async (req: AuthRequest, res: Response) => {
  const requestUserId = userId(req);
  const organizationId = req.params.id;

  const membership = await getActiveMembership(organizationId, requestUserId);
  if (!membership) return res.status(403).json({ error: 'Organization erişim yetkisi yok' });
  if (!canPerformWorkspaceAction(membership.role, 'organization:manage-members')) {
    return res.status(403).json({ error: 'Üye yönetme yetkisi yok' });
  }

  const { role, status } = req.body as { role?: OrganizationRole; status?: 'ACTIVE' | 'INACTIVE' };
  const updated = await OrganizationMember.findOneAndUpdate(
    { _id: req.params.memberId, organizationId },
    {
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
    },
    { new: true }
  ).lean();

  if (!updated) return res.status(404).json({ error: 'Organization member bulunamadı' });
  return res.json(updated);
};

export const deleteOrganizationMember = async (req: AuthRequest, res: Response) => {
  const requestUserId = userId(req);
  const organizationId = req.params.id;

  const membership = await getActiveMembership(organizationId, requestUserId);
  if (!membership) return res.status(403).json({ error: 'Organization erişim yetkisi yok' });
  if (!canPerformWorkspaceAction(membership.role, 'organization:manage-members')) {
    return res.status(403).json({ error: 'Üye yönetme yetkisi yok' });
  }

  const deleted = await OrganizationMember.findOneAndDelete({ _id: req.params.memberId, organizationId }).lean();
  if (!deleted) return res.status(404).json({ error: 'Organization member bulunamadı' });
  return res.json({ ok: true });
};
