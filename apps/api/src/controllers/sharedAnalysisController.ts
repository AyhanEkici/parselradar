import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import OrganizationMember from '../models/OrganizationMember';
import SharedAnalysis from '../models/SharedAnalysis';
import AnalysisRun from '../models/AnalysisRun';
import PropertySubmission from '../models/PropertySubmission';
import WorkspaceActivity from '../models/WorkspaceActivity';
import { canPerformWorkspaceAction, resolveWorkspacePermissions } from '../services/organizations/resolveWorkspacePermissions';

function requestUserId(req: AuthRequest) {
  return new mongoose.Types.ObjectId(String(req.user?._id));
}

async function requireMembership(organizationId: string, userId: mongoose.Types.ObjectId) {
  return OrganizationMember.findOne({ organizationId, userId, status: 'ACTIVE' }).lean();
}

export const createSharedAnalysis = async (req: AuthRequest, res: Response) => {
  const userId = requestUserId(req);
  const organizationId = req.params.organizationId;

  const membership = await requireMembership(organizationId, userId);
  if (!membership || !canPerformWorkspaceAction(membership.role, 'shared-analysis:create')) {
    return res.status(403).json({ error: 'Shared analysis oluşturma yetkisi yok' });
  }

  const { propertyId, comment } = req.body as { propertyId?: string; comment?: string };
  if (!propertyId || !mongoose.Types.ObjectId.isValid(propertyId)) {
    return res.status(400).json({ error: 'Geçersiz propertyId' });
  }

  const [property, latestAnalysis] = await Promise.all([
    PropertySubmission.findById(propertyId).lean(),
    AnalysisRun.findOne({ propertySubmissionId: propertyId }).sort({ createdAt: -1 }).lean(),
  ]);

  if (!property) return res.status(404).json({ error: 'Mülk bulunamadı' });
  if (!latestAnalysis) return res.status(404).json({ error: 'Analiz bulunamadı' });

  const row = await SharedAnalysis.findOneAndUpdate(
    {
      organizationId,
      propertySubmissionId: property._id,
      analysisRunId: latestAnalysis._id,
    },
    {
      $set: { comment: comment || '' },
      $setOnInsert: {
        organizationId,
        propertySubmissionId: property._id,
        analysisRunId: latestAnalysis._id,
        sharedByUserId: userId,
      },
    },
    { new: true, upsert: true }
  ).lean();

  await WorkspaceActivity.create({
    organizationId,
    actorUserId: userId,
    action: 'shared_analysis_created',
    entityType: 'shared_analysis',
    entityId: row?._id,
    metadata: {
      propertyId: String(property._id),
      analysisRunId: String(latestAnalysis._id),
    },
  });

  return res.json(row);
};

export const getSharedAnalyses = async (req: AuthRequest, res: Response) => {
  const userId = requestUserId(req);
  const organizationId = req.params.organizationId;

  const membership = await requireMembership(organizationId, userId);
  if (!membership || !canPerformWorkspaceAction(membership.role, 'shared-analysis:read')) {
    return res.status(403).json({ error: 'Shared analysis görüntüleme yetkisi yok' });
  }

  const rows = await SharedAnalysis.find({ organizationId })
    .sort({ createdAt: -1 })
    .populate('propertySubmissionId', 'addressText il ilce askingPriceTRY areaM2')
    .populate('analysisRunId', 'score signal sourceConfidence analysisVersion fullAnalysis.freshnessScore fullAnalysis.opportunityScore')
    .populate('sharedByUserId', 'name email')
    .lean();

  return res.json({
    permissions: resolveWorkspacePermissions(membership.role),
    rows,
  });
};
