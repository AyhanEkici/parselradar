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
      developmentScenario: full.developmentScenario || [],
      developmentSignals: full.developmentSignals || [],
      coordinates: full.coordinates,
      nearbyInfrastructure: full.nearbyInfrastructure || [],
      infrastructureDistances: full.infrastructureDistances || {},
      spatialSignals: full.spatialSignals || [],
      spatialLiquidity: full.spatialLiquidity,
      clusterStrength: full.clusterStrength,
      geoConfidence: full.geoConfidence,
      mapSummary: full.mapSummary,
      comparableMapPoints: full.comparableMapPoints || [],
      regionalCluster: full.regionalCluster,
      analysisVersion: analysis.analysisVersion || full.analysisVersion,
      refreshReason: analysis.refreshReason || full.refreshReason,
      sourceConfidence: analysis.sourceConfidence || full.sourceConfidence,
      cacheTimestamp: analysis.cacheTimestamp || full.cacheTimestamp,
      refreshStatus: full.refreshStatus,
      freshnessScore: full.freshnessScore,
      ingestionSignals: full.ingestionSignals || [],
      staleFlags: full.staleFlags || [],
      cacheState: full.cacheState,
      trendSignals: full.trendSignals || [],
      marketMomentum: full.marketMomentum,
      volatilityIndex: full.volatilityIndex,
      investorSignal: full.investorSignal,
      connectorStatus: full.connectorStatus,
      districtHeat: full.districtHeat,
      opportunityScore: full.opportunityScore,
      trendVelocity: full.trendVelocity,
      liquidityTrend: full.liquidityTrend,
      alertSignals: full.alertSignals || [],
      governanceEnvelope: full.governanceEnvelope,
      governanceClassification: full.governanceEnvelope?.governanceClassification,
      trustScore: full.governanceEnvelope?.trustScore,
      reportEvidenceSummary: full.governanceEnvelope?.evidenceSummary,
      reportConfidenceSummary: full.governanceEnvelope?.confidenceSummary,
      reportDisclosureSummary: full.governanceEnvelope?.disclosureSummary,
      evidenceTrace: full.governanceEnvelope?.evidenceTrace || [],
      unsupportedAssumptions: full.governanceEnvelope?.unsupportedAssumptions || [],
      speculativeIndicators: full.governanceEnvelope?.speculativeIndicators || [],
      territorialIntelligence: full.territorialIntelligence,
      ingestionGovernance: full.ingestionGovernance,
      ingestionProvenanceEnvelope: full.ingestionProvenanceEnvelope,
      ingestionCompliance: full.ingestionCompliance,
      ingestionTrust: full.ingestionTrust,
      ingestionAuditTrail: full.ingestionAuditTrail,
      connectorGovernance: full.connectorGovernance,
      connectorExecutions: full.connectorExecutions || [],
      ingestionFreshnessEnvelope: full.ingestionFreshnessEnvelope,
      noFakeActiveProof: full.noFakeActiveProof,
      operationalIntelligence: full.operationalIntelligence,
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
    city: property.il || '-',
    district: property.ilce || '-',
  };
  const generatedPropertyTitle = `${titleFields.ownerName}, ${titleFields.address}, ${titleFields.district}/${titleFields.city}`;

  return res.json({
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



