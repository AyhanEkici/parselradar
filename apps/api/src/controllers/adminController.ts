import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { requireAuthUser } from '../utils/authUser';
import { logAuditEvent } from '../utils/auditLog';
import PropertySubmission from '../models/PropertySubmission';
import DealPoolEntry from '../models/DealPoolEntry';
import DealShareAudit from '../models/DealShareAudit';
import ConsentRecord from '../models/ConsentRecord';
import User from '../models/User';
import AnalysisRun from '../models/AnalysisRun';
import CreditLedger from '../models/CreditLedger';
import StripeCheckoutSession from '../models/StripeCheckoutSession';
import DocumentUpload from '../models/DocumentUpload';
import AuditEvent from '../models/AuditEvent';

const toGridFsUrls = (propertyId: string, documentId: string) => ({
  fileUrl: `/properties/${propertyId}/documents/${documentId}/view`,
  downloadUrl: `/properties/${propertyId}/documents/${documentId}/download`,
});

const mapCreationSource = (inputMethod?: string) => {
  const value = String(inputMethod || '').toUpperCase();
  if (value.includes('URL') || value.includes('IMPORT')) return 'IMPORT';
  if (value.includes('API')) return 'API';
  if (value.includes('SCRAP')) return 'SCRAPER';
  return 'MANUAL_ENTRY';
};
// GET /admin/users
export const getAdminUsers = async (req: AuthRequest, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, parseInt(req.query.limit as string) || 25);
  const filter: any = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) {
    const search = req.query.search as string;
    filter.$or = [
      { email: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } }
    ];
  }
  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select('-passwordHash');

  // Compute current credit balance for each user
  const usersWithCredits = await Promise.all(
    users.map(async (u) => {
      const ledger = await CreditLedger.find({ userId: u._id });
      const currentBalance = ledger.reduce((sum, entry) => sum + entry.amount, 0);
      return {
        ...u.toObject(),
        credits: currentBalance,
      };
    })
  );

  res.json({ users: usersWithCredits, page, limit, total, totalPages: Math.ceil(total / limit) });
};

// GET /admin/analyses
export const getAdminAnalyses = async (req: AuthRequest, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, parseInt(req.query.limit as string) || 25);
  const filter: any = {};
  if (req.query.userId) filter.userId = req.query.userId;
  if (req.query.propertyId) filter.propertySubmissionId = req.query.propertyId;
  if (req.query.type) filter.productType = req.query.type;
  const total = await AnalysisRun.countDocuments(filter);
  const analyses = await AnalysisRun.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('userId', 'name email role')
    .populate('propertySubmissionId', 'addressText il ilce mahalleOrKoy ada parsel status');
  res.json({ analyses, page, limit, total, totalPages: Math.ceil(total / limit) });
};

// GET /admin/credit-ledger
export const getAdminCreditLedger = async (req: AuthRequest, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, parseInt(req.query.limit as string) || 25);
  const filter: any = {};
  if (req.query.userId) filter.userId = req.query.userId;
  if (req.query.type) filter.type = req.query.type;
  const total = await CreditLedger.countDocuments(filter);
  const ledger = await CreditLedger.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  res.json({ ledger, page, limit, total, totalPages: Math.ceil(total / limit) });
};

// GET /admin/stripe-sessions
export const getAdminStripeSessions = async (req: AuthRequest, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, parseInt(req.query.limit as string) || 25);
  const filter: any = {};
  if (req.query.userId) filter.userId = req.query.userId;
  if (req.query.status) filter.status = req.query.status;
  const total = await StripeCheckoutSession.countDocuments(filter);
  const sessions = await StripeCheckoutSession.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('userId', 'name email role');
  res.json({ sessions, page, limit, total, totalPages: Math.ceil(total / limit) });
};

export const getAllProperties = async (req: AuthRequest, res: Response) => {
  const properties = await PropertySubmission.find();
  res.json(properties);
};

export const getPropertyById = async (req: AuthRequest, res: Response) => {
  const property = await PropertySubmission.findById(req.params.id).lean();
  if (!property) return res.status(404).json({ error: 'Bulunamadı' });

  const [owner, documents, analyses, audits] = await Promise.all([
    User.findById(property.userId).select('email name role').lean(),
    DocumentUpload.find({ propertySubmissionId: property._id })
      .sort({ uploadedAt: -1 })
      .select('documentType originalName storedName storedPath gridFsFileId uploadedAt mimeType sizeBytes')
      .lean(),
    AnalysisRun.find({ propertySubmissionId: property._id })
      .sort({ createdAt: -1 })
      .select(
        'productType score signal confidence strengths risks missingInputs recommendation factorsUsed createdAt previewSummary fullAnalysis'
      )
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

  const enrichedAnalyses = analyses.map((analysis: any) => {
    const full = (analysis.fullAnalysis || {}) as Record<string, any>;
    return {
      ...analysis,
      recommendations: full.recommendations || [],
      valuationBand: full.valuationBand,
      marketPosition: full.marketPosition,
      developerFit: full.developerFit,
      zoningPotential: full.zoningPotential,
      liquiditySignal: full.liquiditySignal,
      comparableCount: full.comparableCount,
      avgComparablePricePerM2: full.avgComparablePricePerM2,
      marketHeat: full.marketHeat,
      pricingPosition: full.pricingPosition,
      opportunitySignals: full.opportunitySignals || [],
      overpricingRisk: full.overpricingRisk,
      comparableSummary: full.comparableSummary,
      topComparables: full.topComparables || [],
      infrastructureScore: full.infrastructureScore,
      roadAccessScore: full.roadAccessScore,
      utilityCoverage: full.utilityCoverage,
      growthPotential: full.growthPotential,
      regionalDemand: full.regionalDemand,
      strategicLocationSignals: full.strategicLocationSignals || [],
      geoSummary: full.geoSummary,
      subdivisionPotential: full.subdivisionPotential,
      frontageDepthScore: full.frontageDepthScore,
      densityPotential: full.densityPotential,
      developerROI: full.developerROI,
      parcelMergeOpportunity: full.parcelMergeOpportunity,
      rezoningUpside: full.rezoningUpside,
      projectability: full.projectability,
      developmentSignals: full.developmentSignals || [],
      developmentSummary: full.developmentSummary,
    };
  });

  const latestByType = (type: string, altType?: string) =>
    enrichedAnalyses.find((a) => a.productType === type || (altType ? a.productType === altType : false)) || null;
  const latestAnalysis = enrichedAnalyses[0] || null;
  const visibleDocuments = documents.map((doc: any) => ({
    ...doc,
    createdAt: doc.uploadedAt,
    storedName: doc.storedName || null,
    ...(doc.gridFsFileId ? toGridFsUrls(String(property._id), String(doc._id)) : { fileUrl: null, downloadUrl: null }),
    fileMissing: !doc.gridFsFileId,
  }));
  const titleFields = {
    ownerName: owner?.name || '-',
    address: property.addressText || '-',
    city: (property as any).il || '-',
    district: (property as any).ilce || '-',
  };
  const generatedPropertyTitle = `${titleFields.ownerName}, ${titleFields.address}, ${titleFields.district}/${titleFields.city}`;

  res.json({
    property,
    owner,
    creator: owner,
    creationSource: mapCreationSource((property as any).inputMethod),
    generatedPropertyTitle,
    titleDerivation: titleFields,
    documents: visibleDocuments,
    analyses: enrichedAnalyses,
    latestAnalysis,
    analysisSummary: {
      quickScore: latestByType('quick-score', 'QUICK_SCORE'),
      parcelInsight: latestByType('parsel-insight', 'PARSEL_INSIGHT'),
      developerFit: latestByType('developer-fit', 'DEVELOPER_FIT'),
    },
    auditReferences: audits,
  });
};

export const reviewProperty = async (req: AuthRequest, res: Response) => {
  const property = await PropertySubmission.findById(req.params.id);
  if (!property) return res.status(404).json({ error: 'Bulunamadı' });
  Object.assign(property, req.body);
  await property.save();
  res.json(property);
};

export const updatePropertyStatus = async (req: AuthRequest, res: Response) => {
  const user = requireAuthUser(req);
  const allowedStatuses = ['NEW', 'REVIEWING', 'APPROVED', 'REJECTED'];
  const { status } = req.body;

  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Allowed: ${allowedStatuses.join(', ')}` });
  }

  const property = await PropertySubmission.findById(req.params.id);
  if (!property) return res.status(404).json({ error: 'Mülk bulunamadı' });

  const previousStatus = property.status || 'NEW';
  property.status = status;
  await property.save();

  await logAuditEvent({
    type: 'property_status_updated',
    actorUserId: user._id.toString(),
    actorRole: user.role,
    targetType: 'PropertySubmission',
    targetId: String(property._id),
    message: `Property status changed from ${previousStatus} to ${status}`,
    metadata: {
      previousStatus,
      newStatus: status,
      propertyAddress: property.addressText,
    },
    ip: req.ip,
    userAgent: req.get('user-agent'),
    success: true,
  });

  res.json(property);
};

export const acceptDealPool = async (req: AuthRequest, res: Response) => {
  const property = await PropertySubmission.findById(req.params.propertyId);
  if (!property) return res.status(404).json({ error: 'Bulunamadı' });
  const consent = await ConsentRecord.findOne({ propertySubmissionId: property._id });
  if (!consent?.allowDealPoolEvaluation || !consent?.allowContactForMatching) return res.status(400).json({ error: 'Deal Pool izni yok' });
  const entry = await DealPoolEntry.create({ propertySubmissionId: property._id, userId: property.userId, status: 'ACCEPTED', matchCategories: [] });
  res.json(entry);
};

export const shareDealPool = async (req: AuthRequest, res: Response) => {
  const entry = await DealPoolEntry.findById(req.params.entryId);
  if (!entry) return res.status(404).json({ error: 'Deal Pool girişi bulunamadı' });
  // Consent check and audit
  const consent = await ConsentRecord.findOne({ propertySubmissionId: entry.propertySubmissionId });
  if (!consent?.allowDealPoolEvaluation || !consent?.allowContactForMatching) return res.status(400).json({ error: 'Paylaşım izni yok' });
  const adminUser = requireAuthUser(req);
  await DealShareAudit.create({ dealPoolEntryId: entry._id, sharedWithType: req.body.sharedWithType, sharedWithName: req.body.sharedWithName, sharedWithContact: req.body.sharedWithContact, sharedFields: req.body.sharedFields, adminUserId: adminUser._id });
  res.json({ ok: true });
};
