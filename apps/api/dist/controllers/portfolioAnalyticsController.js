"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPortfolioPerformance = exports.getPortfolioExposure = exports.getPortfolioScenarios = exports.getPortfolioBenchmark = exports.getPortfolioAnalytics = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Portfolio_1 = __importDefault(require("../models/Portfolio"));
const PortfolioItem_1 = __importDefault(require("../models/PortfolioItem"));
const PropertySubmission_1 = __importDefault(require("../models/PropertySubmission"));
const AnalysisRun_1 = __importDefault(require("../models/AnalysisRun"));
const OrganizationMember_1 = __importDefault(require("../models/OrganizationMember"));
const connectors_1 = require("../services/connectors");
const calculatePortfolioDiversification_1 = require("../services/portfolioAnalytics/calculatePortfolioDiversification");
const calculatePortfolioExposureMap_1 = require("../services/portfolioAnalytics/calculatePortfolioExposureMap");
const calculatePortfolioConcentrationRisk_1 = require("../services/portfolioAnalytics/calculatePortfolioConcentrationRisk");
const calculatePortfolioOpportunityDistribution_1 = require("../services/portfolioAnalytics/calculatePortfolioOpportunityDistribution");
const calculatePortfolioHealth_1 = require("../services/portfolioAnalytics/calculatePortfolioHealth");
const buildPortfolioPerformanceSnapshot_1 = require("../services/portfolioAnalytics/buildPortfolioPerformanceSnapshot");
const calculatePortfolioBenchmark_1 = require("../services/portfolioAnalytics/calculatePortfolioBenchmark");
const buildRegionalBenchmark_1 = require("../services/benchmarking/buildRegionalBenchmark");
const buildAssetTypeBenchmark_1 = require("../services/benchmarking/buildAssetTypeBenchmark");
const buildLiquidityBenchmark_1 = require("../services/benchmarking/buildLiquidityBenchmark");
const buildOpportunityBenchmark_1 = require("../services/benchmarking/buildOpportunityBenchmark");
const buildGrowthScenario_1 = require("../services/scenarios/buildGrowthScenario");
const buildRiskScenario_1 = require("../services/scenarios/buildRiskScenario");
const buildLiquidityScenario_1 = require("../services/scenarios/buildLiquidityScenario");
const buildInfrastructureImpactScenario_1 = require("../services/scenarios/buildInfrastructureImpactScenario");
const buildMacroStressScenario_1 = require("../services/scenarios/buildMacroStressScenario");
function requesterId(req) {
    return new mongoose_1.default.Types.ObjectId(String(req.user?._id));
}
function confidenceFromSourceConfidence(sourceConfidence) {
    if (sourceConfidence === 'verified')
        return 85;
    if (sourceConfidence === 'medium')
        return 65;
    return 40;
}
function classifyLiquidityBand(liquidityScore) {
    if ((liquidityScore || 0) >= 70)
        return 'high';
    if ((liquidityScore || 0) >= 45)
        return 'medium';
    return 'low';
}
function classifyAssetType(assetType, zoningStatus) {
    const value = String(assetType || zoningStatus || 'unknown').toLowerCase();
    if (value.includes('arsa') || value.includes('land'))
        return 'land';
    if (value.includes('ticaret') || value.includes('commercial'))
        return 'commercial';
    if (value.includes('sanayi') || value.includes('industrial'))
        return 'industrial';
    if (value.includes('konut') || value.includes('residential'))
        return 'residential';
    return 'mixed';
}
function addToBucket(bucket, key, value) {
    bucket[key] = Number(((bucket[key] || 0) + value).toFixed(2));
}
async function resolvePortfolioAccess(req, portfolioId) {
    if (!mongoose_1.default.Types.ObjectId.isValid(portfolioId)) {
        return { error: { status: 400, message: 'Geçersiz portfolio id' } };
    }
    const requesterUserId = requesterId(req);
    const portfolio = await Portfolio_1.default.findById(portfolioId).lean();
    if (!portfolio)
        return { error: { status: 404, message: 'Portfolio bulunamadı' } };
    const ownerUserId = new mongoose_1.default.Types.ObjectId(String(portfolio.userId));
    if (String(ownerUserId) === String(requesterUserId)) {
        const proof = {
            mode: 'OWNER',
            requesterUserId: String(requesterUserId),
            ownerUserId: String(ownerUserId),
            sharedOrganizationIds: [],
        };
        return { portfolio, ownerUserId, proof };
    }
    const [requesterMemberships, ownerMemberships] = await Promise.all([
        OrganizationMember_1.default.find({ userId: requesterUserId, status: 'ACTIVE' }).lean(),
        OrganizationMember_1.default.find({ userId: ownerUserId, status: 'ACTIVE' }).lean(),
    ]);
    const ownerOrgSet = new Set(ownerMemberships.map((m) => String(m.organizationId)));
    const sharedOrganizationIds = requesterMemberships
        .map((m) => String(m.organizationId))
        .filter((orgId) => ownerOrgSet.has(orgId));
    if (sharedOrganizationIds.length === 0) {
        return { error: { status: 403, message: 'Portfolio owner/org erişim yetkisi yok' } };
    }
    const proof = {
        mode: 'ORG_SHARED',
        requesterUserId: String(requesterUserId),
        ownerUserId: String(ownerUserId),
        sharedOrganizationIds,
    };
    return { portfolio, ownerUserId, proof };
}
async function buildPortfolioIntelligence(ownerUserId, portfolioId) {
    const items = await PortfolioItem_1.default.find({ userId: ownerUserId, portfolioId }).lean();
    const propertyIds = items.map((item) => item.propertySubmissionId);
    const [properties, latestAnalyses] = await Promise.all([
        PropertySubmission_1.default.find({ _id: { $in: propertyIds } }).lean(),
        Promise.all(propertyIds.map(async (propertyId) => AnalysisRun_1.default.findOne({ propertySubmissionId: propertyId, userId: ownerUserId }).sort({ createdAt: -1 }).lean())),
    ]);
    const analysisByPropertyId = {};
    latestAnalyses.forEach((analysis) => {
        if (analysis)
            analysisByPropertyId[String(analysis.propertySubmissionId)] = analysis;
    });
    const holdings = items.map((item) => {
        const property = properties.find((p) => String(p._id) === String(item.propertySubmissionId));
        const analysis = analysisByPropertyId[String(item.propertySubmissionId)];
        const full = (analysis?.fullAnalysis || {});
        const sourceConfidence = analysis?.sourceConfidence ||
            full.sourceConfidence ||
            'low';
        const confidence = Number(analysis?.confidence || confidenceFromSourceConfidence(sourceConfidence));
        const freshnessScore = Number(full.freshnessScore || 0);
        const opportunityScore = Number(full.opportunityScore || property?.opportunityScore || 0);
        const analysisScore = Number(analysis?.score || 0);
        const liquidityBand = classifyLiquidityBand(Number(full.liquidityScore || 0));
        const valueTRY = Number(property?.askingPriceTRY || 0);
        const storedConnectorState = String(full?.connectorStatus?.networkState || '');
        const connectorNetworkState = storedConnectorState ||
            (0, connectors_1.buildConnectorNetwork)({
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
    const byCity = {};
    const byAssetType = {};
    const byLiquidityBand = {};
    holdings.forEach((holding) => {
        addToBucket(byCity, holding.city, holding.valueTRY);
        addToBucket(byAssetType, holding.assetType, holding.valueTRY);
        addToBucket(byLiquidityBand, holding.liquidityBand, holding.valueTRY);
    });
    const totalValue = Number(holdings.reduce((sum, holding) => sum + holding.valueTRY, 0).toFixed(2));
    const averageOpportunity = holdings.length > 0
        ? Number((holdings.reduce((sum, h) => sum + h.opportunityScore, 0) / holdings.length).toFixed(2))
        : 0;
    const averageScore = holdings.length > 0
        ? Number((holdings.reduce((sum, h) => sum + h.analysisScore, 0) / holdings.length).toFixed(2))
        : 0;
    const freshnessScoreAverage = holdings.length > 0
        ? Number((holdings.reduce((sum, h) => sum + h.freshnessScore, 0) / holdings.length).toFixed(2))
        : 0;
    const confidenceAverage = holdings.length > 0
        ? Number((holdings.reduce((sum, h) => sum + h.confidence, 0) / holdings.length).toFixed(2))
        : 0;
    const staleCount = holdings.filter((h) => h.freshnessScore < 55).length;
    const staleRatioPercent = holdings.length > 0 ? Number(((staleCount / holdings.length) * 100).toFixed(2)) : 0;
    const connectorStateCounts = {};
    holdings.forEach((holding) => {
        connectorStateCounts[holding.connectorNetworkState] = (connectorStateCounts[holding.connectorNetworkState] || 0) + 1;
    });
    const healthyOrPartial = (connectorStateCounts.healthy || 0) +
        (connectorStateCounts.partial || 0);
    const connectorLiveRatioPercent = holdings.length > 0 ? Number(((healthyOrPartial / holdings.length) * 100).toFixed(2)) : 0;
    const dominantConnectorState = Object.entries(connectorStateCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';
    const opportunityDistribution = (0, calculatePortfolioOpportunityDistribution_1.calculatePortfolioOpportunityDistribution)({
        opportunities: holdings.map((h) => h.opportunityScore),
    });
    const exposureMap = (0, calculatePortfolioExposureMap_1.calculatePortfolioExposureMap)({
        totalValue,
        byCity,
        byAssetType,
        byLiquidityBand,
    });
    const concentrationRisk = (0, calculatePortfolioConcentrationRisk_1.calculatePortfolioConcentrationRisk)({
        byCity: exposureMap.byCity,
        byAssetType: exposureMap.byAssetType,
        byLiquidityBand: exposureMap.byLiquidityBand,
    });
    const diversification = (0, calculatePortfolioDiversification_1.calculatePortfolioDiversification)({
        totalValue,
        byCity,
        byAssetType,
        byLiquidityBand,
    });
    const health = (0, calculatePortfolioHealth_1.calculatePortfolioHealth)({
        diversificationScore: diversification.overallDiversificationScore,
        concentrationIndex: concentrationRisk.concentrationIndex,
        staleRatioPercent,
        averageConfidence: confidenceAverage,
        connectorLiveRatioPercent,
    });
    const performance = (0, buildPortfolioPerformanceSnapshot_1.buildPortfolioPerformanceSnapshot)({
        averageScore,
        averageOpportunity,
        freshnessScoreAverage,
        confidenceAverage,
        connectorNetworkState: dominantConnectorState,
        coveredItemCount: holdings.filter((h) => h.analysisScore > 0 || h.opportunityScore > 0).length,
        totalItemCount: holdings.length,
    });
    const portfolioBenchmark = (0, calculatePortfolioBenchmark_1.calculatePortfolioBenchmark)({
        averageOpportunityScore: averageOpportunity,
        averageScore,
        benchmarkOpportunity: 55,
        benchmarkScore: 60,
    });
    const regionalBenchmark = (0, buildRegionalBenchmark_1.buildRegionalBenchmark)({ exposureByCity: exposureMap.byCity });
    const assetTypeBenchmark = (0, buildAssetTypeBenchmark_1.buildAssetTypeBenchmark)({ exposureByAssetType: exposureMap.byAssetType });
    const liquidityBenchmark = (0, buildLiquidityBenchmark_1.buildLiquidityBenchmark)({ exposureByLiquidityBand: exposureMap.byLiquidityBand });
    const opportunityBenchmark = (0, buildOpportunityBenchmark_1.buildOpportunityBenchmark)({
        averageOpportunity,
        highRatioPercent: opportunityDistribution.ratios.high,
    });
    const growthScenario = (0, buildGrowthScenario_1.buildGrowthScenario)({
        averageOpportunity,
        diversificationScore: diversification.overallDiversificationScore,
        confidenceAverage,
    });
    const riskScenario = (0, buildRiskScenario_1.buildRiskScenario)({
        concentrationIndex: concentrationRisk.concentrationIndex,
        staleRatioPercent,
        connectorNetworkState: dominantConnectorState,
    });
    const liquidityScenario = (0, buildLiquidityScenario_1.buildLiquidityScenario)({ liquidityBands: exposureMap.byLiquidityBand });
    const infrastructureImpactScenario = (0, buildInfrastructureImpactScenario_1.buildInfrastructureImpactScenario)({
        averageOpportunity,
        connectorLiveRatioPercent,
    });
    const macroStressScenario = (0, buildMacroStressScenario_1.buildMacroStressScenario)({
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
const getPortfolioAnalytics = async (req, res) => {
    const access = await resolvePortfolioAccess(req, req.params.id);
    if ('error' in access)
        return res.status(access.error.status).json({ error: access.error.message });
    const intelligence = await buildPortfolioIntelligence(access.ownerUserId, req.params.id);
    return res.json({
        portfolioId: req.params.id,
        accessControl: access.proof,
        analytics: intelligence.analytics,
        truthState: intelligence.truthState,
        generatedAt: new Date().toISOString(),
    });
};
exports.getPortfolioAnalytics = getPortfolioAnalytics;
const getPortfolioBenchmark = async (req, res) => {
    const access = await resolvePortfolioAccess(req, req.params.id);
    if ('error' in access)
        return res.status(access.error.status).json({ error: access.error.message });
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
exports.getPortfolioBenchmark = getPortfolioBenchmark;
const getPortfolioScenarios = async (req, res) => {
    const access = await resolvePortfolioAccess(req, req.params.id);
    if ('error' in access)
        return res.status(access.error.status).json({ error: access.error.message });
    const intelligence = await buildPortfolioIntelligence(access.ownerUserId, req.params.id);
    return res.json({
        portfolioId: req.params.id,
        accessControl: access.proof,
        scenarios: intelligence.scenarios,
        truthState: intelligence.truthState,
        generatedAt: new Date().toISOString(),
    });
};
exports.getPortfolioScenarios = getPortfolioScenarios;
const getPortfolioExposure = async (req, res) => {
    const access = await resolvePortfolioAccess(req, req.params.id);
    if ('error' in access)
        return res.status(access.error.status).json({ error: access.error.message });
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
exports.getPortfolioExposure = getPortfolioExposure;
const getPortfolioPerformance = async (req, res) => {
    const access = await resolvePortfolioAccess(req, req.params.id);
    if ('error' in access)
        return res.status(access.error.status).json({ error: access.error.message });
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
exports.getPortfolioPerformance = getPortfolioPerformance;
