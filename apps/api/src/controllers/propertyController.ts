import { Response } from 'express';
import mongoose from 'mongoose';
import { logAuditEvent } from '../utils/auditLog';
import { AuthRequest } from '../middleware/auth';
import { requireAuthUser } from '../utils/authUser';
import PropertySubmission from '../models/PropertySubmission';
import DocumentUpload from '../models/DocumentUpload';
import AnalysisRun from '../models/AnalysisRun';
import AuditEvent from '../models/AuditEvent';
import User from '../models/User';
import { PropertySubmissionCreateInputSchema } from '../validation/propertySchemas';

export const createProperty = async (req: AuthRequest, res: Response) => {
  try {
    const user = requireAuthUser(req);
    const parsed = PropertySubmissionCreateInputSchema.safeParse(req.body);
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] || 'form');
        if (!fields[key]) fields[key] = issue.message;
      }
      await logAuditEvent({
        type: 'property_create',
        actorUserId: user._id.toString(),
        actorRole: user.role,
        targetType: 'User',
        targetId: user._id.toString(),
        message: 'Property create failed: invalid data',
        metadata: { errors: parsed.error.errors },
        ip: req.ip,
        userAgent: req.get('user-agent'),
        success: false,
      });
      return res.status(400).json({ error: 'Validation failed', fields });
    }
    const input = parsed.data;
    const doc: Record<string, unknown> = { ...input, userId: user._id };
    const askingPrice = Number(input.askingPriceTRY);
    const area = Number(input.areaM2);
    if (
      Number.isFinite(askingPrice) &&
      Number.isFinite(area) &&
      area > 0
    ) {
      doc.pricePerM2 = askingPrice / area;
    }
    // createdAt/updatedAt handled by Mongoose timestamps
    const property = await PropertySubmission.create(doc);
    await logAuditEvent({
      type: 'property_create',
      actorUserId: user._id.toString(),
      actorRole: user.role,
      targetType: 'PropertySubmission',
      targetId: property._id.toString(),
      message: 'Property created',
      metadata: { propertyId: property._id.toString() },
      ip: req.ip,
      userAgent: req.get('user-agent'),
      success: true,
    });
    res.json(property);
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      const fields: Record<string, string> = {};
      Object.keys(err.errors || {}).forEach((key) => {
        fields[key] = err.errors[key]?.message || 'Invalid value';
      });
      await logAuditEvent({
        type: 'property_create',
        actorUserId: undefined,
        actorRole: undefined,
        targetType: 'PropertySubmission',
        targetId: undefined,
        message: 'Property create failed: mongoose validation',
        metadata: { error: err.errors },
        ip: req.ip,
        userAgent: req.get('user-agent'),
        success: false,
      });
      return res.status(400).json({ error: 'Validation failed', fields });
    }
    console.error('Property creation error:', err);
    await logAuditEvent({
      type: 'property_create',
      actorUserId: undefined,
      actorRole: undefined,
      targetType: 'PropertySubmission',
      targetId: undefined,
      message: 'Property create failed: server error',
      metadata: { error: err.message },
      ip: req.ip,
      userAgent: req.get('user-agent'),
      success: false,
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyProperties = async (req: AuthRequest, res: Response) => {
  const user = requireAuthUser(req);
  const properties = await PropertySubmission.find({ userId: user._id }).sort({ createdAt: -1 });
  res.json(properties);
};

export const getPropertyById = async (req: AuthRequest, res: Response) => {
  const user = requireAuthUser(req);
  const { propertyId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    return res.status(400).json({ error: 'Geçersiz propertyId' });
  }

  const property = await PropertySubmission.findById(propertyId).lean();
  if (!property) {
    return res.status(404).json({ error: 'Mülk bulunamadı' });
  }

  const ownerId = String(property.userId);
  const currentUserId = String(user._id);
  const isOwner = ownerId === currentUserId;
  const isAdmin = user.role === 'ADMIN';
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: 'Yetkisiz erişim' });
  }

  const [owner, documents, analyses, audits] = await Promise.all([
    User.findById(property.userId).select('email name role').lean(),
    DocumentUpload.find({ propertySubmissionId: property._id })
      .sort({ uploadedAt: -1 })
      .select('documentType originalName uploadedAt mimeType sizeBytes')
      .lean(),
    AnalysisRun.find({ propertySubmissionId: property._id })
      .sort({ createdAt: -1 })
      .select('productType score signal createdAt previewSummary')
      .lean(),
    AuditEvent.find({
      $or: [
        { targetId: String(property._id) },
        { 'metadata.propertyId': String(property._id) },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('type message success createdAt')
      .lean(),
  ]);

  const latestByType = (type: string) => analyses.find((a) => a.productType === type) || null;

  return res.json({
    property,
    owner,
    documents,
    analyses,
    analysisSummary: {
      quickScore: latestByType('quick-score'),
      parcelInsight: latestByType('parsel-insight'),
      developerFit: latestByType('developer-fit'),
    },
    auditReferences: audits,
  });
};
