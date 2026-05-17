import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import AnalysisRun from '../models/AnalysisRun';
import CreditLedger from '../models/CreditLedger';
import DocumentUpload from '../models/DocumentUpload';
import PropertySubmission from '../models/PropertySubmission';
import { scoreProperty } from '../services/analysis/scoreProperty';
import { buildComparableMarketIntelligence } from '../services/comparables';
import { buildGeoIntelligence } from '../services/geo';
import { buildDevelopmentScenario } from '../services/development';
import { logAuditEvent } from '../utils/auditLog';
import { getUserCredits } from '../utils/credits';

const COSTS = { quick: 1 };

type ProductType = 'QUICK_SCORE' | 'PARSEL_INSIGHT' | 'DEVELOPER_FIT';

async function deductCredits(userId: mongoose.Types.ObjectId, amount: number) {
  const credits = await getUserCredits(userId);
  if (credits < amount) throw new Error('Yetersiz kredi');
  await CreditLedger.create({ userId, type: 'ANALYSIS', amount: -amount, reason: 'Analiz' });
}

function normalizeUserId(userId: unknown) {
  if (typeof userId === 'string') return new mongoose.Types.ObjectId(userId);
  return userId as mongoose.Types.ObjectId;
}

function recommendedActionFromList(recommendations?: string[]) {
  if (!recommendations || recommendations.length === 0) {
    return 'Eksik verileri tamamlayıp tekrar analiz edin.';
  }
  return recommendations[0];
}

async function computeEngineResult(propertyDoc: any, userId: mongoose.Types.ObjectId, productType: ProductType) {
  const documents = await DocumentUpload.find({
    propertySubmissionId: propertyDoc._id,
    userId,
  })
    .select('documentType mimeType originalName sizeBytes gridFsFileId')
    .lean();

  const mappedDocs = documents.map((d) => ({
    documentType: d.documentType,
    mimeType: d.mimeType,
    originalName: d.originalName,
    sizeBytes: d.sizeBytes,
    fileMissing: !d.gridFsFileId,
  }));

  const propertyObj = propertyDoc.toObject();

  return scoreProperty({
    property: {
      il: propertyObj.il,
      ilce: propertyObj.ilce,
      askingPriceTRY: propertyObj.askingPriceTRY,
      areaM2: propertyObj.areaM2,
      pricePerM2: propertyObj.pricePerM2,
      zoningStatus: propertyObj.zoningStatus,
      tapuType: propertyObj.tapuType,
      ada: propertyObj.ada,
      parsel: propertyObj.parsel,
      pafta: propertyObj.pafta,
      roadAccess: propertyObj.roadAccess,
      electricity: propertyObj.electricity,
      water: propertyObj.water,
    },
    documents: mappedDocs,
    productType,
  });
}

function toResponseFromRun(run: any, reused: boolean) {
  const full = (run.fullAnalysis || {}) as Record<string, any>;
  const preview = (run.previewSummary || {}) as Record<string, any>;

  return {
    id: run._id,
    score: run.score,
    signal: run.signal,
    confidence: run.confidence,
    strengths: run.strengths || [],
    risks: run.risks || [],
    recommendations: full.recommendations || [],
    recommendation: run.recommendation || recommendedActionFromList(full.recommendations),
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
    reused,
    summary: preview.summary || '',
    createdAt: run.createdAt,
    factorsUsed: run.factorsUsed || {},
    topRisks: run.riskFlags || [],
    missingDocs: run.missingInfo || [],
    recommendedAction: run.recommendation || recommendedActionFromList(full.recommendations),
  };
}

async function runAnalysis(req: AuthRequest, res: Response, options: { productType: ProductType; creditCost?: number }) {
  const userId = req.user?._id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const normalizedUserId = normalizeUserId(userId);
  const property = await PropertySubmission.findOne({
    _id: req.params.propertyId,
    userId: normalizedUserId,
  });

  if (!property) {
    return res.status(404).json({ error: 'Mülk bulunamadı' });
  }

  const force = req.query.force === '1' || req.query.force === 'true';

  const existingRun = await AnalysisRun.findOne({
    propertySubmissionId: property._id,
    userId: normalizedUserId,
    productType: options.productType,
  }).sort({ createdAt: -1 });

  if (existingRun && !(options.productType === 'QUICK_SCORE' && force)) {
    return res.json(toResponseFromRun(existingRun, true));
  }

  try {
    if (options.creditCost && options.creditCost > 0) {
      await deductCredits(normalizedUserId, options.creditCost);
    }

    const engine = await computeEngineResult(property, normalizedUserId, options.productType);
    const propertyObj = property.toObject();

    const comparableCandidates = await PropertySubmission.find({
      _id: { $ne: property._id },
      askingPriceTRY: { $gt: 0 },
      areaM2: { $gt: 0 },
    })
      .sort({ createdAt: -1 })
      .limit(600)
      .select('il ilce zoningStatus areaM2 askingPriceTRY pricePerM2 roadAccess electricity water createdAt')
      .lean();

    const comparableMarket = buildComparableMarketIntelligence({
      subject: {
        _id: String(property._id),
        il: propertyObj.il,
        ilce: propertyObj.ilce,
        zoningStatus: propertyObj.zoningStatus,
        areaM2: propertyObj.areaM2,
        askingPriceTRY: propertyObj.askingPriceTRY,
        pricePerM2: propertyObj.pricePerM2,
        roadAccess: propertyObj.roadAccess,
        electricity: propertyObj.electricity,
        water: propertyObj.water,
        createdAt: propertyObj.createdAt,
      },
      candidates: comparableCandidates.map((candidate: any) => ({
        _id: String(candidate._id),
        il: candidate.il,
        ilce: candidate.ilce,
        zoningStatus: candidate.zoningStatus,
        areaM2: candidate.areaM2,
        askingPriceTRY: candidate.askingPriceTRY,
        pricePerM2: candidate.pricePerM2,
        roadAccess: candidate.roadAccess,
        electricity: candidate.electricity,
        water: candidate.water,
        createdAt: candidate.createdAt,
      })),
    });

    const geoIntelligence = buildGeoIntelligence({
      city: propertyObj.il,
      district: propertyObj.ilce,
      areaM2: propertyObj.areaM2,
      zoningStatus: propertyObj.zoningStatus,
      roadAccess: propertyObj.roadAccess,
      electricity: propertyObj.electricity,
      water: propertyObj.water,
    });

    const developmentScenario = buildDevelopmentScenario({
      areaM2: propertyObj.areaM2,
      city: propertyObj.il,
      district: propertyObj.ilce,
      zoning: propertyObj.zoningStatus,
      marketHeat: comparableMarket.marketHeat,
      roadAccessScore: geoIntelligence.roadAccessScore,
      infrastructureScore: geoIntelligence.infrastructureScore,
      growthPhase: geoIntelligence.growthPotential?.developmentPhase,
      avgComparablePricePerM2: comparableMarket.avgComparablePricePerM2,
    });

    const run = await AnalysisRun.create({
      propertySubmissionId: property._id,
      userId: normalizedUserId,
      productType: options.productType,
      score: engine.score,
      signal: engine.signal,
      confidence: engine.confidence,
      strengths: engine.strengths,
      risks: engine.risks,
      riskFlags: engine.riskFlags,
      missingInputs: engine.missingInputs,
      missingInfo: engine.missingInputs,
      assumptions: [],
      unverifiableInfo: [],
      factorsUsed: engine.factorsUsed,
      recommendation: recommendedActionFromList(engine.recommendations),
      previewSummary: {
        summary: engine.summary,
        reused: false,
        score: engine.score,
        signal: engine.signal,
      },
      fullAnalysis: {
        recommendations: engine.recommendations,
        valuationBand: engine.valuationBand,
        marketPosition: engine.marketPosition,
        developerFit: engine.developerFit,
        zoningPotential: engine.zoningPotential,
        liquiditySignal: engine.liquiditySignal,
        riskClassification: engine.riskClassification,
        comparableCount: comparableMarket.comparableCount,
        avgComparablePricePerM2: comparableMarket.avgComparablePricePerM2,
        marketHeat: comparableMarket.marketHeat,
        pricingPosition: comparableMarket.pricingPosition,
        opportunitySignals: comparableMarket.opportunitySignals,
        overpricingRisk: comparableMarket.overpricingRisk,
        comparableSummary: comparableMarket.comparableSummary,
        topComparables: comparableMarket.topComparables,
        comparableRiskSignals: comparableMarket.riskSignals,
        pricingDeltaRatio: comparableMarket.pricingDeltaRatio,
        medianComparablePricePerM2: comparableMarket.medianComparablePricePerM2,
        infrastructureScore: geoIntelligence.infrastructureScore,
        roadAccessScore: geoIntelligence.roadAccessScore,
        utilityCoverage: geoIntelligence.utilityCoverage,
        growthPotential: geoIntelligence.growthPotential,
        regionalDemand: geoIntelligence.regionalDemand,
        strategicLocationSignals: geoIntelligence.strategicLocationSignals,
        geoSummary: geoIntelligence.geoSummary,
        subdivisionPotential: developmentScenario.subdivisionPotential,
        frontageDepthScore: developmentScenario.frontageDepthScore,
        densityPotential: developmentScenario.densityPotential,
        developerROI: developmentScenario.developerROI,
        parcelMergeOpportunity: developmentScenario.parcelMergeOpportunity,
        rezoningUpside: developmentScenario.rezoningUpside,
        projectability: developmentScenario.projectability,
        developmentSignals: developmentScenario.developmentSignals,
        developmentSummary: developmentScenario.developmentSummary,
      },
    });

    if (options.productType === 'QUICK_SCORE') {
      await logAuditEvent({
        type: 'analysis_quick_score_created',
        actorUserId: normalizedUserId.toString(),
        actorRole: req.user?.role,
        targetType: 'AnalysisRun',
        targetId: run._id.toString(),
        message: 'Quick-score created by weighted deterministic engine',
        metadata: {
          propertyId: property._id.toString(),
          score: engine.score,
          confidence: engine.confidence,
          marketPosition: engine.marketPosition,
          developerFit: engine.developerFit,
          zoningPotential: engine.zoningPotential,
          liquiditySignal: engine.liquiditySignal,
        },
        ip: req.ip,
        userAgent: req.get('user-agent'),
        success: true,
      });
    }

    return res.json(toResponseFromRun(run, false));
  } catch (err: any) {
    if ((err?.message || '').toLowerCase().includes('yetersiz kredi')) {
      await logAuditEvent({
        type: 'analysis_insufficient_credits',
        actorUserId: normalizedUserId.toString(),
        actorRole: req.user?.role,
        targetType: 'User',
        targetId: normalizedUserId.toString(),
        message: 'Insufficient credits for analysis run',
        metadata: { propertyId: property._id.toString(), productType: options.productType },
        ip: req.ip,
        userAgent: req.get('user-agent'),
        success: false,
      });
    }

    return res.status(400).json({ error: err?.message || 'Analysis error' });
  }
}

export const quickScore = async (req: AuthRequest, res: Response) =>
  runAnalysis(req, res, { productType: 'QUICK_SCORE', creditCost: COSTS.quick });

export const parselInsight = async (req: AuthRequest, res: Response) =>
  runAnalysis(req, res, { productType: 'PARSEL_INSIGHT' });

export const developerFit = async (req: AuthRequest, res: Response) =>
  runAnalysis(req, res, { productType: 'DEVELOPER_FIT' });
