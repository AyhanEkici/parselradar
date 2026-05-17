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
import { buildDevelopmentIntelligence } from '../services/development';
import { buildSpatialIntelligence } from '../services/spatial';
import { ingestComparableListings } from '../services/ingestion/ingestComparableListings';
import { ingestMunicipalitySignals } from '../services/ingestion/ingestMunicipalitySignals';
import { ingestInfrastructureSignals } from '../services/ingestion/ingestInfrastructureSignals';
import { scheduleAnalysisRefresh } from '../services/jobs/scheduleAnalysisRefresh';
import { queuePropertyReanalysis } from '../services/jobs/queuePropertyReanalysis';
import { processSpatialRefresh } from '../services/jobs/processSpatialRefresh';
import { processMarketRefresh } from '../services/jobs/processMarketRefresh';
import { buildMarketCache } from '../services/cache/buildMarketCache';
import { warmComparableCache } from '../services/cache/warmComparableCache';
import { buildConnectorNetwork } from '../services/connectors';
import { buildSignalNetwork } from '../services/signals';
import { buildTrendSnapshots } from '../services/trends';
import { buildAlertNetwork } from '../services/alerts';
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
    analysisVersion: run.analysisVersion || full.analysisVersion,
    refreshReason: run.refreshReason || full.refreshReason,
    sourceConfidence: run.sourceConfidence || full.sourceConfidence,
    cacheTimestamp: run.cacheTimestamp || full.cacheTimestamp,
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
.select('il ilce zoningStatus areaM2 askingPriceTRY pricePerM2 roadAccess electricity water latitude longitude coordinateSource geocodeConfidence createdAt')
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

    const developmentIntelligence = buildDevelopmentIntelligence({
      areaM2: propertyObj.areaM2,
      zoningStatus: propertyObj.zoningStatus,
      district: propertyObj.ilce,
      roadAccess: propertyObj.roadAccess,
      addressText: propertyObj.addressText,
      mahalleOrKoy: propertyObj.mahalleOrKoy,
      pricingDeltaRatio: comparableMarket.pricingDeltaRatio,
      infrastructureScore: geoIntelligence.infrastructureScore,
      roadAccessScore: geoIntelligence.roadAccessScore,
      regionalDemandScore: geoIntelligence.regionalDemand?.demandScore,
    });

    const spatialIntelligence = buildSpatialIntelligence({
      city: propertyObj.il,
      district: propertyObj.ilce,
      latitude: propertyObj.latitude,
      longitude: propertyObj.longitude,
      coordinateSource: propertyObj.coordinateSource,
      geocodeConfidence: propertyObj.geocodeConfidence,
      zoningStatus: propertyObj.zoningStatus,
      comparables: comparableCandidates.map((candidate: any) => ({
        _id: String(candidate._id),
        il: candidate.il,
        ilce: candidate.ilce,
        areaM2: candidate.areaM2,
        pricePerM2: candidate.pricePerM2,
        latitude: candidate.latitude,
        longitude: candidate.longitude,
        coordinateSource: candidate.coordinateSource,
        geocodeConfidence: candidate.geocodeConfidence,
      })),
    });

    const refreshPlan = scheduleAnalysisRefresh({
      propertyId: String(property._id),
      lastAnalysisAt: existingRun?.createdAt,
      lastSpatialRefresh: propertyObj.lastSpatialRefresh,
      lastMarketRefresh: propertyObj.lastMarketRefresh,
    });

    const queuedRefresh = queuePropertyReanalysis({
      propertyId: String(property._id),
      reason: refreshPlan.refreshReason,
    });

    const listingIngestion = ingestComparableListings({
      sourceRows: comparableCandidates.map((candidate: any) => ({
        externalId: String(candidate._id),
        il: candidate.il,
        ilce: candidate.ilce,
        areaM2: candidate.areaM2,
        pricePerM2: candidate.pricePerM2,
        askingPriceTRY: candidate.askingPriceTRY,
        latitude: candidate.latitude,
        longitude: candidate.longitude,
      })),
    });

    const municipalityIngestion = ingestMunicipalitySignals({
      city: propertyObj.il,
      district: propertyObj.ilce,
    });

    const infrastructureIngestion = ingestInfrastructureSignals({
      city: propertyObj.il,
    });

    const spatialRefresh = processSpatialRefresh({
      propertyId: String(property._id),
      staleFlags: refreshPlan.staleFlags,
      lastSpatialRefresh: propertyObj.lastSpatialRefresh,
    });

    const marketRefresh = processMarketRefresh({
      propertyId: String(property._id),
      staleFlags: refreshPlan.staleFlags,
      lastMarketRefresh: propertyObj.lastMarketRefresh,
    });

      const districtKey = `${String(propertyObj.il || '').toLowerCase()}:${String(propertyObj.ilce || '').toLowerCase()}`;
    const marketCache = buildMarketCache({
      districtKey,
      payload: {
        comparableCount: comparableMarket.comparableCount,
        marketHeat: comparableMarket.marketHeat,
        clusterStrength: spatialIntelligence.clusterStrength,
      },
    });

    const comparableCache = warmComparableCache({
      districtKey,
      comparableCount: listingIngestion.ingestedCount,
    });

    const ingestionSignals = Array.from(new Set([
      ...listingIngestion.signals,
      ...municipalityIngestion.signals,
      ...infrastructureIngestion.signals,
      queuedRefresh.refreshStatus === 'queued' ? 'reanalysis_queued' : 'reanalysis_not_queued',
      spatialRefresh.refreshReason,
      marketRefresh.refreshReason,
    ]));

    const sourceConfidence = municipalityIngestion.matched && infrastructureIngestion.airportCount + infrastructureIngestion.industrialCount > 0
      ? 'verified'
      : listingIngestion.ingestedCount >= 3
        ? 'medium'
        : 'low';

    const freshnessBase = sourceConfidence === 'verified' ? 84 : sourceConfidence === 'medium' ? 66 : 42;
    const freshnessScore = Math.max(0, Math.min(100, freshnessBase - refreshPlan.staleFlags.length * 18));

    const cacheState = {
      market: marketCache.key ? 'warm' : 'cold',
      comparable: comparableCache.key ? 'warm' : 'cold',
      spatial: spatialRefresh.refreshStatus === 'refreshing' ? 'refreshing' : 'warm',
    };

    const connectorNetwork = buildConnectorNetwork({
      city: propertyObj.il,
      district: propertyObj.ilce,
      parcelId: `${String(propertyObj.ada || '')}-${String(propertyObj.parsel || '')}`,
      lastSpatialRefresh: propertyObj.lastSpatialRefresh,
      lastMarketRefresh: propertyObj.lastMarketRefresh,
    });

    const degradedConnectorCount = connectorNetwork.snapshots.filter((snapshot) =>
      ['FAILED', 'STALE', 'NOT_CONFIGURED', 'MOCK_DISABLED'].includes(snapshot.status)
    ).length;
    const totalConnectorCount = connectorNetwork.snapshots.length || 1;
    const liveOrReadyConnectorCount = connectorNetwork.snapshots.filter((snapshot) =>
      snapshot.status === 'LIVE' || snapshot.status === 'READY'
    ).length;
    const connectorLiveRatio = liveOrReadyConnectorCount / totalConnectorCount;

    const signalNetwork = buildSignalNetwork({
      score: engine.score,
      marketHeat: comparableMarket.marketHeat,
      pricingDeltaRatio: comparableMarket.pricingDeltaRatio,
      freshnessScore,
      connectorLiveRatio,
      currentAvgPricePerM2: comparableMarket.avgComparablePricePerM2,
      baselinePricePerM2: propertyObj.pricePerM2 || comparableMarket.avgComparablePricePerM2,
      infrastructureScore: geoIntelligence.infrastructureScore,
      roadAccessScore: geoIntelligence.roadAccessScore,
      strategicLocationSignals: geoIntelligence.strategicLocationSignals,
      comparableCount: comparableMarket.comparableCount,
      liquidityScore: spatialIntelligence.spatialLiquidity?.score,
      volatilityIndex: 38 + degradedConnectorCount * 11,
      overpricingRisk: comparableMarket.overpricingRisk,
    });

    const trendSnapshots = buildTrendSnapshots({
      marketMomentum: signalNetwork.marketMomentum,
      comparableCount: comparableMarket.comparableCount,
      liquidityScore: spatialIntelligence.spatialLiquidity?.score,
      liquiditySignal: spatialIntelligence.spatialLiquidity?.label,
      districtHeat: signalNetwork.districtHeat,
      priceAccelerationScore: signalNetwork.priceAcceleration.accelerationScore,
      connectorDegradedCount: degradedConnectorCount,
    });

    const alertNetwork = buildAlertNetwork({
      opportunityScore: signalNetwork.opportunityScore,
      volatilityIndex: trendSnapshots.volatility.volatilityIndex,
      marketMomentum: signalNetwork.marketMomentum,
      previousMomentum: Math.max(
        0,
        signalNetwork.marketMomentum - Math.round(signalNetwork.priceAcceleration.deltaRatio * 100)
      ),
      infrastructureImpact: signalNetwork.infrastructureImpact,
      investorSignal: signalNetwork.investorSignal,
    });

    const trendSignals = Array.from(
      new Set([
        ...ingestionSignals,
        ...signalNetwork.trendSignals,
        ...trendSnapshots.snapshots,
        ...alertNetwork.alertSignals,
      ])
    );

    property.set({
      lastSpatialRefresh: new Date(),
      lastMarketRefresh: new Date(),
      lastTrendRefresh: new Date(),
      opportunityScore: signalNetwork.opportunityScore,
      momentumScore: signalNetwork.marketMomentum,
      districtHeat: signalNetwork.districtHeat,
      ingestionState:
        connectorNetwork.networkState === 'degraded'
          ? 'stale'
          : refreshPlan.staleFlags.length > 0
            ? 'queued'
            : 'ready',
    });
    await property.save();

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
      analysisVersion: 'V9',
      refreshReason: refreshPlan.refreshReason,
      sourceConfidence,
      cacheTimestamp: new Date(),
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
        subdivisionPotential: developmentIntelligence.subdivisionPotential,
        frontageDepthScore: developmentIntelligence.frontageDepthScore,
        densityPotential: developmentIntelligence.densityPotential,
        developerROI: developmentIntelligence.developerROI,
        parcelMergeOpportunity: developmentIntelligence.parcelMergeOpportunity,
        rezoningUpside: developmentIntelligence.rezoningUpside,
        projectability: developmentIntelligence.projectability,
        developmentScenario: developmentIntelligence.developmentScenario,
        developmentSignals: developmentIntelligence.developmentSignals,
        coordinates: spatialIntelligence.coordinates,
        nearbyInfrastructure: spatialIntelligence.nearbyInfrastructure,
        infrastructureDistances: spatialIntelligence.infrastructureDistances,
        spatialSignals: spatialIntelligence.spatialSignals,
        spatialLiquidity: spatialIntelligence.spatialLiquidity,
        clusterStrength: spatialIntelligence.clusterStrength,
        geoConfidence: spatialIntelligence.geoConfidence,
        mapSummary: spatialIntelligence.mapSummary,
        comparableMapPoints: spatialIntelligence.comparableMapPoints,
        regionalCluster: spatialIntelligence.regionalCluster,
        analysisVersion: 'V9',
        refreshStatus: refreshPlan.staleFlags.length > 0 ? 'queued' : 'fresh',
        freshnessScore,
        ingestionSignals,
        staleFlags: refreshPlan.staleFlags,
        cacheState,
        trendSignals,
        marketMomentum: signalNetwork.marketMomentum,
        volatilityIndex: trendSnapshots.volatility.volatilityIndex,
        investorSignal: signalNetwork.investorSignal,
        connectorStatus: connectorNetwork,
        districtHeat: signalNetwork.districtHeat,
        opportunityScore: signalNetwork.opportunityScore,
        trendVelocity: trendSnapshots.velocity,
        liquidityTrend: trendSnapshots.liquidity,
        alertSignals: alertNetwork.alertSignals,
        investorNotifications: alertNetwork.notifications,
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




