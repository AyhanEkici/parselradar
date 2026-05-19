import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import OrganizationMember from '../models/OrganizationMember';
import WorkspacePortfolio from '../models/WorkspacePortfolio';
import WorkspaceWatchlist from '../models/WorkspaceWatchlist';
import WorkspaceActivity from '../models/WorkspaceActivity';
import SharedAnalysis from '../models/SharedAnalysis';
import PropertySubmission from '../models/PropertySubmission';
import AnalysisRun from '../models/AnalysisRun';
import { canPerformWorkspaceAction, resolveWorkspacePermissions } from '../services/organizations/resolveWorkspacePermissions';
import { buildWorkspaceActivityFeed } from '../services/workspace/buildWorkspaceActivityFeed';
import { calculateWorkspaceSignals } from '../services/workspace/calculateWorkspaceSignals';
import { buildSharedPortfolioSummary } from '../services/workspace/buildSharedPortfolioSummary';
import { buildSharedWatchlistSummary } from '../services/workspace/buildSharedWatchlistSummary';
import { isAdmin } from '../utils/ownership';

function requestUserId(req: AuthRequest) {
  return new mongoose.Types.ObjectId(String(req.user?._id));
}

async function requireMembership(organizationId: string, userId: mongoose.Types.ObjectId) {
  return OrganizationMember.findOne({ organizationId, userId, status: 'ACTIVE' }).lean();
}

async function logActivity(input: {
  organizationId: string;
  actorUserId: mongoose.Types.ObjectId;
  action: string;
  entityType: string;
  entityId?: mongoose.Types.ObjectId;
  metadata?: Record<string, unknown>;
}) {
  await WorkspaceActivity.create({
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    metadata: input.metadata,
  });
}

export const getWorkspaceDashboard = async (req: AuthRequest, res: Response) => {
  const userId = requestUserId(req);
  const organizationId = req.params.organizationId;

  const membership = await requireMembership(organizationId, userId);
  if (!membership || !canPerformWorkspaceAction(membership.role, 'workspace:read')) {
    return res.status(403).json({ error: 'Workspace görüntüleme yetkisi yok' });
  }

  const [portfolioRows, watchlistRows, sharedRows, activities] = await Promise.all([
    WorkspacePortfolio.find({ organizationId }).sort({ createdAt: -1 }).lean(),
    WorkspaceWatchlist.find({ organizationId, status: 'ACTIVE' }).sort({ createdAt: -1 }).lean(),
    SharedAnalysis.find({ organizationId }).sort({ createdAt: -1 }).lean(),
    WorkspaceActivity.find({ organizationId }).sort({ createdAt: -1 }).limit(50).lean(),
  ]);

  const analysisIds = sharedRows.map((row: any) => row.analysisRunId);
  const analysisRuns = await AnalysisRun.find({ _id: { $in: analysisIds } }).lean();

  const signals = calculateWorkspaceSignals({
    sharedAnalyses: analysisRuns.map((row: any) => ({
      score: row.score,
      opportunityScore: row.fullAnalysis?.opportunityScore,
      freshnessScore: row.fullAnalysis?.freshnessScore,
    })),
  });

  return res.json({
    permissions: resolveWorkspacePermissions(membership.role),
    metrics: {
      portfolioCount: portfolioRows.length,
      watchlistCount: watchlistRows.length,
      sharedAnalysisCount: sharedRows.length,
    },
    signals,
    activity: buildWorkspaceActivityFeed({ activities: activities as Array<Record<string, unknown>> }),
  });
};

export const getWorkspacePortfolios = async (req: AuthRequest, res: Response) => {
  const userId = requestUserId(req);
  const organizationId = req.params.organizationId;

  const membership = await requireMembership(organizationId, userId);
  if (!membership || !canPerformWorkspaceAction(membership.role, 'workspace:read')) {
    return res.status(403).json({ error: 'Shared portfolio görüntüleme yetkisi yok' });
  }

  const rows = await WorkspacePortfolio.find({ organizationId })
    .sort({ createdAt: -1 })
    .populate('propertySubmissionId', 'addressText il ilce askingPriceTRY areaM2')
    .lean();

  return res.json(buildSharedPortfolioSummary({ rows: rows as Array<Record<string, unknown>> }));
};

export const getWorkspaceWatchlist = async (req: AuthRequest, res: Response) => {
  const userId = requestUserId(req);
  const organizationId = req.params.organizationId;

  const membership = await requireMembership(organizationId, userId);
  if (!membership || !canPerformWorkspaceAction(membership.role, 'workspace:read')) {
    return res.status(403).json({ error: 'Shared watchlist görüntüleme yetkisi yok' });
  }

  const rows = await WorkspaceWatchlist.find({ organizationId, status: 'ACTIVE' })
    .sort({ createdAt: -1 })
    .populate('propertySubmissionId', 'addressText il ilce askingPriceTRY areaM2')
    .lean();

  return res.json(buildSharedWatchlistSummary({ rows: rows as Array<Record<string, unknown>> }));
};

export const getWorkspaceActivity = async (req: AuthRequest, res: Response) => {
  const userId = requestUserId(req);
  const organizationId = req.params.organizationId;

  const membership = await requireMembership(organizationId, userId);
  if (!membership || !canPerformWorkspaceAction(membership.role, 'workspace:read')) {
    return res.status(403).json({ error: 'Workspace activity görüntüleme yetkisi yok' });
  }

  const rows = await WorkspaceActivity.find({ organizationId })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('actorUserId', 'name email')
    .lean();

  return res.json(buildWorkspaceActivityFeed({ activities: rows as Array<Record<string, unknown>> }));
};

export const addWorkspacePortfolioProperty = async (req: AuthRequest, res: Response) => {
  const userId = requestUserId(req);
  const organizationId = req.params.organizationId;

  const membership = await requireMembership(organizationId, userId);
  if (!membership || !canPerformWorkspaceAction(membership.role, 'workspace:manage')) {
    return res.status(403).json({ error: 'Shared portfolio düzenleme yetkisi yok' });
  }

  const { propertyId, title, note } = req.body as { propertyId?: string; title?: string; note?: string };
  if (!propertyId || !mongoose.Types.ObjectId.isValid(propertyId)) {
    return res.status(400).json({ error: 'Geçersiz propertyId' });
  }

  const property = await PropertySubmission.findById(propertyId).lean();
  if (!property) return res.status(404).json({ error: 'Mülk bulunamadı' });
  if (!isAdmin(req.user) && String(property.userId) !== String(userId)) {
    return res.status(404).json({ error: 'Mülk bulunamadı' });
  }

  const row = await WorkspacePortfolio.findOneAndUpdate(
    {
      organizationId,
      title: title || 'Shared Portfolio',
      propertySubmissionId: property._id,
    },
    {
      $set: { note: note || '' },
      $setOnInsert: {
        organizationId,
        title: title || 'Shared Portfolio',
        propertySubmissionId: property._id,
        addedByUserId: userId,
      },
    },
    { new: true, upsert: true }
  ).lean();

  await logActivity({
    organizationId,
    actorUserId: userId,
    action: 'workspace_portfolio_property_added',
    entityType: 'workspace_portfolio',
    entityId: row?._id as any,
    metadata: { propertyId: String(property._id), title: title || 'Shared Portfolio' },
  });

  return res.json(row);
};

export const addWorkspaceWatchlistProperty = async (req: AuthRequest, res: Response) => {
  const userId = requestUserId(req);
  const organizationId = req.params.organizationId;

  const membership = await requireMembership(organizationId, userId);
  if (!membership || !canPerformWorkspaceAction(membership.role, 'workspace:manage')) {
    return res.status(403).json({ error: 'Shared watchlist düzenleme yetkisi yok' });
  }

  const { propertyId, note } = req.body as { propertyId?: string; note?: string };
  if (!propertyId || !mongoose.Types.ObjectId.isValid(propertyId)) {
    return res.status(400).json({ error: 'Geçersiz propertyId' });
  }

  const property = await PropertySubmission.findById(propertyId).lean();
  if (!property) return res.status(404).json({ error: 'Mülk bulunamadı' });
  if (!isAdmin(req.user) && String(property.userId) !== String(userId)) {
    return res.status(404).json({ error: 'Mülk bulunamadı' });
  }

  const row = await WorkspaceWatchlist.findOneAndUpdate(
    { organizationId, propertySubmissionId: property._id },
    {
      $set: { status: 'ACTIVE', note: note || '' },
      $setOnInsert: {
        organizationId,
        propertySubmissionId: property._id,
        addedByUserId: userId,
      },
    },
    { new: true, upsert: true }
  ).lean();

  await logActivity({
    organizationId,
    actorUserId: userId,
    action: 'workspace_watchlist_property_added',
    entityType: 'workspace_watchlist',
    entityId: row?._id as any,
    metadata: { propertyId: String(property._id) },
  });

  return res.json(row);
};
