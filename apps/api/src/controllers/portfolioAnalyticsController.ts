import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import Portfolio from '../models/Portfolio';
import PortfolioItem from '../models/PortfolioItem';
import PropertySubmission from '../models/PropertySubmission';
import AnalysisRun from '../models/AnalysisRun';
import OrganizationMember from '../models/OrganizationMember';
import { buildConnectorNetwork } from '../services/connectors';
import { calculatePortfolioDiversification } from '../services/portfolioAnalytics/calculatePortfolioDiversification';
import { calculatePortfolioExposureMap } from '../services/portfolioAnalytics/calculatePortfolioExposureMap';
import { calculatePortfolioConcentrationRisk } from '../services/portfolioAnalytics/calculatePortfolioConcentrationRisk';
import { calculatePortfolioOpportunityDistribution } from '../services/portfolioAnalytics/calculatePortfolioOpportunityDistribution';
import { calculatePortfolioHealth } from '../services/portfolioAnalytics/calculatePortfolioHealth';
import { buildPortfolioPerformanceSnapshot } from '../services/portfolioAnalytics/buildPortfolioPerformanceSnapshot';
import { calculatePortfolioBenchmark } from '../services/portfolioAnalytics/calculatePortfolioBenchmark';
import { buildRegionalBenchmark } from '../services/benchmarking/buildRegionalBenchmark';
import { buildAssetTypeBenchmark } from '../services/benchmarking/buildAssetTypeBenchmark';
import { buildLiquidityBenchmark } from '../services/benchmarking/buildLiquidityBenchmark';
import { buildOpportunityBenchmark } from '../services/benchmarking/buildOpportunityBenchmark';
import { buildGrowthScenario } from '../services/scenarios/buildGrowthScenario';
import { buildRiskScenario } from '../services/scenarios/buildRiskScenario';
import { buildLiquidityScenario } from '../services/scenarios/buildLiquidityScenario';
import { buildInfrastructureImpactScenario } from '../services/scenarios/buildInfrastructureImpactScenario';
import { buildMacroStressScenario } from '../services/scenarios/buildMacroStressScenario';

type AccessProof = {
  mode: 'OWNER' | 'ORG_SHARED';
  requesterUserId: string;
  ownerUserId: string;
  sharedOrganizationIds: string[];
};

type AccessDenied = {
  error: { status: number; message: string };
};

type AccessGranted = {
  portfolio: any;
  ownerUserId: mongoose.Types.ObjectId;
  proof: AccessProof;
};

type HoldingIntelligence = {
  city: string;
  assetType: string;
  liquidityBand: 'high' | 'medium' | 'low';
  valueTRY: number;
  opportunityScore: number;
  analysisScore: number;
  freshnessScore: number;
  confidence: number;
  sourceConfidence: 'low' | 'medium' | 'verified';
  connectorNetworkState: string;
};

function requesterId(req: AuthRequest) {
  return new mongoose.Types.ObjectId(String(req.user?._id));
}

function confidenceFromSourceConfidence(sourceConfidence: 'low' | 'medium' | 'verified') {
  if (sourceConfidence === 'verified') return 85;
  if (sourceConfidence === 'medium') return 65;
  return 40;
}

function classifyLiquidityBand(liquidityScore?: number): 'high' | 'medium' | 'low' {
  if ((liquidityScore || 0) >= 70) return 'high';
  if ((liquidityScore || 0) >= 45) return 'medium';
  return 'low';
}

function classifyAssetType(assetType?: string, zoningStatus?: string) {
  const value = String(assetType || zoningStatus || 'unknown').toLowerCase();
  if (value.includes('arsa') || value.includes('land')) return 'land';
  if (value.includes('ticaret') || value.includes('commercial')) return 'commercial';
  if (value.includes('sanayi') || value.includes('industrial')) return 'industrial';
  if (value.includes('konut') || value.includes('residential')) return 'residential';
  return 'mixed';
}

function addToBucket(bucket: Record<string, number>, key: string, value: number) {
  bucket[key] = Number(((bucket[key] || 0) + value).toFixed(2));
}

async function resolvePortfolioAccess(req: AuthRequest, portfolioId: string): Promise<AccessDenied | AccessGranted> {
  if (!mongoose.Types.ObjectId.isValid(portfolioId)) {
    return { error: { status: 400, message: 'Geçersiz portfolio id' } };
  }

  const requesterUserId = requesterId(req);
  const portfolio = await Portfolio.findById(portfolioId).lean();
  if (!portfolio) return { error: { status: 404, message: 'Portfolio bulunamadı' } };

  const ownerUserId = new mongoose.Types.ObjectId(String((portfolio as any).userId));

  if (String(ownerUserId) === String(requesterUserId)) {
    const proof: AccessProof = {
      mode: 'OWNER',
      requesterUserId: String(requesterUserId),
      ownerUserId: String(ownerUserId),
      sharedOrganizationIds: [],
    };
    return { portfolio, ownerUserId, proof };
  }

  const [requesterMemberships, ownerMemberships] = await Promise.all([
    OrganizationMember.find({ userId: requesterUserId, status: 'ACTIVE' }).lean(),
    OrganizationMember.find({ userId: ownerUserId, status: 'ACTIVE' }).lean(),
  ]);

  const ownerOrgSet = new Set(ownerMemberships.map((m: any) => String(m.organizationId)));
  const sharedOrganizationIds = requesterMemberships
    .map((m: any) => String(m.organizationId))
    .filter((orgId) => ownerOrgSet.has(orgId));

  if (sharedOrganizationIds.length === 0) {
    return { error: { status: 403, message: 'Portfolio owner/org erişim yetkisi yok' } };
  }

  const proof: AccessProof = {
    mode: 'ORG_SHARED',
    requesterUserId: String(requesterUserId),
    ownerUserId: String(ownerUserId),
    sharedOrganizationIds,
  };

  return { portfolio, ownerUserId, proof };
}

async function buildPortfolioIntelligence(ownerUserId: mongoose.Types.ObjectId, portfolioId: string) {
  const items = await PortfolioItem.find({ userId: ownerUserId, portfolioId }).lean();
  const propertyIds = items.map((item: any) => item.propertySubmissionId);

  const [properties, latestAnalyses] = await Promise.all([
    PropertySubmission.find({ _id: { $in: propertyIds } }).lean(),
    Promise.all(
      propertyIds.map(async (propertyId: any) =>
        AnalysisRun.findOne({ propertySubmissionId: propertyId, userId: ownerUserId }).sort({ createdAt: -1 }).lean()
      )
    ),
  ]);

  const analysisByPropertyId: Record<string, any> = {};
  latestAnalyses.forEach((analysis: any) => {
    if (analysis) analysisByPropertyId[String(analysis.propertySubmissionId)] = analysis;
  });

  const holdings: HoldingIntelligence[] = items.map((item: any) => {
    const property = properties.find((p: any) => String(p._id) === String(item.propertySubmissionId));
    const analysis = analysisByPropertyId[String(item.propertySubmissionId)];
    const full = (analysis?.fullAnalysis || {}) as Record<string, any>;

    const sourceConfidence =
      (analysis?.sourceConfidence as 'low' | 'medium' | 'verified' | undefined) ||
      (full.sourceConfidence as 'low' | 'medium' | 'verified' | undefined) ||
      'low';

    const confidence = Number(analysis?.confidence || confidenceFromSourceConfidence(sourceConfidence));
    const freshnessScore = Number(full.freshnessScore || 0);
    const opportunityScore = Number(full.opportunityScore || property?.opportunityScore || 0);
    const analysisScore = Number(analysis?.score || 0);
    const liquidityBand = classifyLiquidityBand(Number(full.liquidityScore || 0));
    const valueTRY = Number(property?.askingPriceTRY || 0);

    const storedConnectorState = String(full?.connectorStatus?.networkState || '');
    const connectorNetworkState = storedConnectorState ||
      buildConnectorNetwork({
        city: property?.il,
        district: property?.ilce,
        parcelId: `${String(property?.ada || '')}/${String(property?.parsel || '')}`,
        lastSpatialRefresh: property?.lastSpatialRefresh,
        lastMarketRefresh: property?.lastMarketRefresh,
      }).networkState;

    return {
      city: String(property?.il || 'unknown').toLowerCase(),
      assetType: classifyAssetType(property?.assetType, property?.zoningStatus),
      liquidityBand,
      valueTRY,
      opportunityScore,
      analysisScore,
      freshnessScore,
      confidence,
      sourceConfidence,
      connectorNetworkState,
    };
  });

  const byCity: Record<string, number> = {};
  const byAssetType: Record<string, number> = {};
  const byLiquidityBand: Record<string, number> = {};

  holdings.forEach((holding) => {
    addToBucket(byCity, holding.city, holding.valueTRY);
    addToBucket(byAssetType, holding.assetType, holding.valueTRY);
    addToBucket(byLiquidityBand, holding.liquidityBand, holding.valueTRY);
  });

  const totalValue = Number(holdings.reduce((sum, holding) => sum + holding.valueTRY, 0).toFixed(2));

  const averageOpportunity =
    holdings.length > 0
      ? Number((holdings.reduce((sum, h) => sum + h.opportunityScore, 0) / holdings.length).toFixed(2))
      : 0;

  const averageScore =
    holdings.length > 0
      ? Number((holdings.reduce((sum, h) => sum + h.analysisScore, 0) / holdings.length).toFixed(2))
      : 0;

  const freshnessScoreAverage =
    holdings.length > 0
      ? Number((holdings.reduce((sum, h) => sum + h.freshnessScore, 0) / holdings.length).toFixed(2))
      : 0;

  const confidenceAverage =
    holdings.length > 0
      ? Number((holdings.reduce((sum, h) => sum + h.confidence, 0) / holdings.length).toFixed(2))
      : 0;

  const staleCount = holdings.filter((h) => h.freshnessScore < 55).length;
  const staleRatioPercent = holdings.length > 0 ? Number(((staleCount / holdings.length) * 100).toFixed(2)) : 0;

  const connectorStateCounts: Record<string, number> = {};
  holdings.forEach((holding) => {
    connectorStateCounts[holding.connectorNetworkState] = (connectorStateCounts[holding.connectorNetworkState] || 0) + 1;
  });

  const healthyOrPartial =
    (connectorStateCounts.healthy || 0) +
    (connectorStateCounts.partial || 0);

  const connectorLiveRatioPercent =
    holdings.length > 0 ? Number(((healthyOrPartial / holdings.length) * 100).toFixed(2)) : 0;

  const dominantConnectorState =
    Object.entries(connectorStateCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';

  const opportunityDistribution = calculatePortfolioOpportunityDistribution({
    opportunities: holdings.map((h) => h.opportunityScore),
  });

  const exposureMap = calculatePortfolioExposureMap({
    totalValue,
    byCity,
    byAssetType,
    byLiquidityBand,
  });

  const concentrationRisk = calculatePortfolioConcentrationRisk({
    byCity: exposureMap.byCity,
    byAssetType: exposureMap.byAssetType,
    byLiquidityBand: exposureMap.byLiquidityBand,
  });

  const diversification = calculatePortfolioDiversification({
    totalValue,
    byCity,
    byAssetType,
    byLiquidityBand,
  });

  const health = calculatePortfolioHealth({
    diversificationScore: diversification.overallDiversificationScore,
    concentrationIndex: concentrationRisk.concentrationIndex,
    staleRatioPercent,
    averageConfidence: confidenceAverage,
    connectorLiveRatioPercent,
  });

  const performance = buildPortfolioPerformanceSnapshot({
    averageScore,
    averageOpportunity,
    freshnessScoreAverage,
    confidenceAverage,
    connectorNetworkState: dominantConnectorState,
    coveredItemCount: holdings.filter((h) => h.analysisScore > 0 || h.opportunityScore > 0).length,
    totalItemCount: holdings.length,
  });

  const portfolioBenchmark = calculatePortfolioBenchmark({
    averageOpportunityScore: averageOpportunity,
    averageScore,
    benchmarkOpportunity: 55,
    benchmarkScore: 60,
  });

  const regionalBenchmark = buildRegionalBenchmark({ exposureByCity: exposureMap.byCity });
  const assetTypeBenchmark = buildAssetTypeBenchmark({ exposureByAssetType: exposureMap.byAssetType });
  const liquidityBenchmark = buildLiquidityBenchmark({ exposureByLiquidityBand: exposureMap.byLiquidityBand });
  const opportunityBenchmark = buildOpportunityBenchmark({
    averageOpportunity,
    highRatioPercent: opportunityDistribution.ratios.high,
  });

  const growthScenario = buildGrowthScenario({
    averageOpportunity,
    diversificationScore: diversification.overallDiversificationScore,
    confidenceAverage,
  });

  const riskScenario = buildRiskScenario({
    concentrationIndex: concentrationRisk.concentrationIndex,
    staleRatioPercent,
    connectorNetworkState: dominantConnectorState,
  });

  const liquidityScenario = buildLiquidityScenario({ liquidityBands: exposureMap.byLiquidityBand });

  const infrastructureImpactScenario = buildInfrastructureImpactScenario({
    averageOpportunity,
    connectorLiveRatioPercent,
  });

  const macroStressScenario = buildMacroStressScenario({
    concentrationIndex: concentrationRisk.concentrationIndex,
    confidenceAverage,
    freshnessScoreAverage,
  });

  return {
    analytics: {
      health,
      diversification,
      concentrationRisk,
      opportunityDistribution,
      exposureMap,
      performance,
      portfolioBenchmark,
    },
    benchmarks: {
      regionalBenchmark,
      assetTypeBenchmark,
      liquidityBenchmark,
      opportunityBenchmark,
    },
    scenarios: {
      growthScenario,
      riskScenario,
      liquidityScenario,
      infrastructureImpactScenario,
      macroStressScenario,
    },
    truthState: {
      freshness: {
        average: freshnessScoreAverage,
        staleCount,
        staleRatioPercent,
      },
      confidence: {
        average: confidenceAverage,
        sourceConfidenceDistribution: {
          verified: holdings.filter((h) => h.sourceConfidence === 'verified').length,
          medium: holdings.filter((h) => h.sourceConfidence === 'medium').length,
          low: holdings.filter((h) => h.sourceConfidence === 'low').length,
        },
      },
      connectorState: {
        dominantState: dominantConnectorState,
        stateCounts: connectorStateCounts,
        liveRatioPercent: connectorLiveRatioPercent,
      },
      sourceAvailability: {
        portfolioItemCount: holdings.length,
        analyzedItemCount: holdings.filter((h) => h.analysisScore > 0 || h.opportunityScore > 0).length,
        coverageRatio: performance.sourceCoverage.coverageRatio,
      },
      note: 'All portfolio analytics are derived from existing analysis and connector signals. No external ROI/market performance is fabricated.',
    },
  };
}

export const getPortfolioAnalytics = async (req: AuthRequest, res: Response) => {
  const access = await resolvePortfolioAccess(req, req.params.id);
  if ('error' in access) return res.status(access.error.status).json({ error: access.error.message });

  const intelligence = await buildPortfolioIntelligence(access.ownerUserId, req.params.id);

  return res.json({
    portfolioId: req.params.id,
    accessControl: access.proof,
    analytics: intelligence.analytics,
    truthState: intelligence.truthState,
    generatedAt: new Date().toISOString(),
  });
};

export const getPortfolioBenchmark = async (req: AuthRequest, res: Response) => {
  const access = await resolvePortfolioAccess(req, req.params.id);
  if ('error' in access) return res.status(access.error.status).json({ error: access.error.message });

  const intelligence = await buildPortfolioIntelligence(access.ownerUserId, req.params.id);

  return res.json({
    portfolioId: req.params.id,
    accessControl: access.proof,
    benchmark: {
      portfolioBenchmark: intelligence.analytics.portfolioBenchmark,
      ...intelligence.benchmarks,
    },
    truthState: intelligence.truthState,
    generatedAt: new Date().toISOString(),
  });
};

export const getPortfolioScenarios = async (req: AuthRequest, res: Response) => {
  const access = await resolvePortfolioAccess(req, req.params.id);
  if ('error' in access) return res.status(access.error.status).json({ error: access.error.message });

  const intelligence = await buildPortfolioIntelligence(access.ownerUserId, req.params.id);

  return res.json({
    portfolioId: req.params.id,
    accessControl: access.proof,
    scenarios: intelligence.scenarios,
    truthState: intelligence.truthState,
    generatedAt: new Date().toISOString(),
  });
};

export const getPortfolioExposure = async (req: AuthRequest, res: Response) => {
  const access = await resolvePortfolioAccess(req, req.params.id);
  if ('error' in access) return res.status(access.error.status).json({ error: access.error.message });

  const intelligence = await buildPortfolioIntelligence(access.ownerUserId, req.params.id);

  return res.json({
    portfolioId: req.params.id,
    accessControl: access.proof,
    exposure: intelligence.analytics.exposureMap,
    concentrationRisk: intelligence.analytics.concentrationRisk,
    diversification: intelligence.analytics.diversification,
    truthState: intelligence.truthState,
    generatedAt: new Date().toISOString(),
  });
};

export const getPortfolioPerformance = async (req: AuthRequest, res: Response) => {
  const access = await resolvePortfolioAccess(req, req.params.id);
  if ('error' in access) return res.status(access.error.status).json({ error: access.error.message });

  const intelligence = await buildPortfolioIntelligence(access.ownerUserId, req.params.id);

  return res.json({
    portfolioId: req.params.id,
    accessControl: access.proof,
    performance: intelligence.analytics.performance,
    health: intelligence.analytics.health,
    portfolioBenchmark: intelligence.analytics.portfolioBenchmark,
    truthState: intelligence.truthState,
    generatedAt: new Date().toISOString(),
  });
};
