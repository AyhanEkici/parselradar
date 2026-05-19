"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPortfolioSummary = exports.deleteWatchlistItem = exports.createWatchlistItem = exports.getWatchlist = exports.deleteSavedAnalysis = exports.createSavedAnalysis = exports.getSavedAnalyses = exports.getInvestorDashboard = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const SavedAnalysis_1 = __importDefault(require("../models/SavedAnalysis"));
const Watchlist_1 = __importDefault(require("../models/Watchlist"));
const Portfolio_1 = __importDefault(require("../models/Portfolio"));
const PortfolioItem_1 = __importDefault(require("../models/PortfolioItem"));
const AnalysisRun_1 = __importDefault(require("../models/AnalysisRun"));
const PropertySubmission_1 = __importDefault(require("../models/PropertySubmission"));
const buildInvestorDashboardSummary_1 = require("../services/portfolio/buildInvestorDashboardSummary");
const calculatePortfolioOpportunityScore_1 = require("../services/portfolio/calculatePortfolioOpportunityScore");
const reportGovernanceEnvelope_1 = require("../services/reporting/reportGovernanceEnvelope");
const buildTerritorialIntelligence_1 = require("../services/intelligence/buildTerritorialIntelligence");
function userObjectId(req) {
    return new mongoose_1.default.Types.ObjectId(String(req.user?._id));
}
const getInvestorDashboard = async (req, res) => {
    const userId = userObjectId(req);
    const [savedAnalyses, watchlist, portfolios, latestAnalyses] = await Promise.all([
        SavedAnalysis_1.default.find({ userId }).lean(),
        Watchlist_1.default.find({ userId, status: 'ACTIVE' }).lean(),
        Portfolio_1.default.find({ userId }).lean(),
        AnalysisRun_1.default.find({ userId }).sort({ createdAt: -1 }).limit(100).lean(),
    ]);
    const opportunity = (0, calculatePortfolioOpportunityScore_1.calculatePortfolioOpportunityScore)({
        analyses: latestAnalyses.map((a) => ({
            score: a.score,
            opportunityScore: a.fullAnalysis?.opportunityScore,
            freshnessScore: a.fullAnalysis?.freshnessScore,
        })),
    });
    const summary = (0, buildInvestorDashboardSummary_1.buildInvestorDashboardSummary)({
        savedAnalysesCount: savedAnalyses.length,
        watchlistCount: watchlist.length,
        portfolioCount: portfolios.length,
        averageOpportunityScore: opportunity.averageOpportunity,
        staleIntelligenceCount: opportunity.staleIntelligenceCount,
        highPotentialProperties: opportunity.highPotentialCount,
    });
    const latest = latestAnalyses[0];
    const governanceSnapshot = latest
        ? (0, reportGovernanceEnvelope_1.buildReportGovernanceEnvelope)({
            score: latest.score,
            confidence: latest.confidence,
            summary: latest.previewSummary?.summary,
            recommendations: latest.fullAnalysis?.recommendations || [],
            risks: latest.riskFlags || [],
            missingInputs: latest.missingInputs || [],
            staleFlags: latest.fullAnalysis?.staleFlags || [],
            sourceConfidence: latest.sourceConfidence || latest.fullAnalysis?.sourceConfidence,
            freshnessScore: latest.fullAnalysis?.freshnessScore,
            trendSignals: latest.fullAnalysis?.trendSignals || [],
            opportunitySignals: latest.fullAnalysis?.opportunitySignals || [],
            analysisVersion: latest.analysisVersion || latest.fullAnalysis?.analysisVersion,
        })
        : null;
    const territorialSnapshot = latest
        ? (0, buildTerritorialIntelligence_1.buildTerritorialIntelligence)({
            score: latest.score,
            confidence: latest.confidence,
            sourceConfidence: latest.sourceConfidence || latest.fullAnalysis?.sourceConfidence,
            freshnessScore: latest.fullAnalysis?.freshnessScore,
            marketHeat: latest.fullAnalysis?.marketHeat,
            comparableCount: latest.fullAnalysis?.comparableCount,
            opportunityScore: latest.fullAnalysis?.opportunityScore,
            marketMomentum: latest.fullAnalysis?.marketMomentum,
            districtHeat: latest.fullAnalysis?.districtHeat,
            volatilityIndex: latest.fullAnalysis?.volatilityIndex,
            trendVelocityScore: latest.fullAnalysis?.trendVelocity?.velocityScore,
            liquidityTrendScore: latest.fullAnalysis?.liquidityTrend?.liquidityTrendScore,
            pricingDeltaRatio: latest.fullAnalysis?.pricingDeltaRatio,
            overpricingRisk: latest.fullAnalysis?.overpricingRisk,
            zoningPotential: latest.fullAnalysis?.zoningPotential,
            developmentSignals: latest.fullAnalysis?.developmentSignals,
            strategicLocationSignals: latest.fullAnalysis?.strategicLocationSignals,
            missingInputs: latest.missingInputs || [],
            staleFlags: latest.fullAnalysis?.staleFlags || [],
            unsupportedAssumptionsCount: (governanceSnapshot?.unsupportedAssumptions || []).length,
            infrastructureScore: latest.fullAnalysis?.infrastructureScore,
            roadAccessScore: latest.fullAnalysis?.roadAccessScore,
            infrastructureDistances: latest.fullAnalysis?.infrastructureDistances,
            investorSignal: latest.fullAnalysis?.investorSignal,
            regionalDemandScore: latest.fullAnalysis?.regionalDemand?.demandScore,
            riskFlags: latest.riskFlags || [],
            recommendations: latest.fullAnalysis?.recommendations || [],
        })
        : null;
    const ingestionSnapshot = latest?.fullAnalysis?.ingestionGovernance || null;
    const operationalSnapshot = latest?.fullAnalysis?.operationalIntelligence || null;
    const autonomySnapshot = latest?.fullAnalysis?.autonomyIntelligence || null;
    return res.json({
        summary,
        confidence: {
            inheritedFromAnalyses: true,
            note: 'All investor intelligence inherits existing sourceConfidence and freshnessScore fields.',
        },
        governanceSnapshot,
        territorialSnapshot,
        ingestionSnapshot,
        operationalSnapshot,
        autonomySnapshot,
    });
};
exports.getInvestorDashboard = getInvestorDashboard;
const getSavedAnalyses = async (req, res) => {
    const userId = userObjectId(req);
    const saved = await SavedAnalysis_1.default.find({ userId }).sort({ createdAt: -1 }).lean();
    res.json(saved);
};
exports.getSavedAnalyses = getSavedAnalyses;
const createSavedAnalysis = async (req, res) => {
    const userId = userObjectId(req);
    const { propertyId } = req.body;
    if (!propertyId || !mongoose_1.default.Types.ObjectId.isValid(propertyId)) {
        return res.status(400).json({ error: 'Geçersiz propertyId' });
    }
    const [property, analysis] = await Promise.all([
        PropertySubmission_1.default.findOne({ _id: propertyId, userId }).lean(),
        AnalysisRun_1.default.findOne({ propertySubmissionId: propertyId, userId }).sort({ createdAt: -1 }).lean(),
    ]);
    if (!property)
        return res.status(404).json({ error: 'Mülk bulunamadı' });
    if (!analysis)
        return res.status(404).json({ error: 'Analiz bulunamadı' });
    const created = await SavedAnalysis_1.default.findOneAndUpdate({
        userId,
        propertySubmissionId: property._id,
        analysisRunId: analysis._id,
    }, {
        $setOnInsert: {
            userId,
            propertySubmissionId: property._id,
            analysisRunId: analysis._id,
            title: property.addressText || `${property.il}/${property.ilce}`,
            summary: analysis.previewSummary?.summary || analysis.signal,
            score: analysis.score,
            signal: analysis.signal,
            confidence: analysis.confidence,
            sourceConfidence: analysis.sourceConfidence || analysis.fullAnalysis?.sourceConfidence,
            freshnessScore: analysis.fullAnalysis?.freshnessScore,
            analysisVersion: analysis.analysisVersion || analysis.fullAnalysis?.analysisVersion,
        },
    }, { new: true, upsert: true }).lean();
    return res.json(created);
};
exports.createSavedAnalysis = createSavedAnalysis;
const deleteSavedAnalysis = async (req, res) => {
    const userId = userObjectId(req);
    const doc = await SavedAnalysis_1.default.findOneAndDelete({ _id: req.params.id, userId }).lean();
    if (!doc)
        return res.status(404).json({ error: 'Kayıt bulunamadı' });
    return res.json({ ok: true });
};
exports.deleteSavedAnalysis = deleteSavedAnalysis;
const getWatchlist = async (req, res) => {
    const userId = userObjectId(req);
    const rows = await Watchlist_1.default.find({ userId, status: 'ACTIVE' })
        .sort({ createdAt: -1 })
        .populate('propertySubmissionId', 'addressText il ilce status')
        .lean();
    const enriched = await Promise.all(rows.map(async (row) => {
        const latest = await AnalysisRun_1.default.findOne({ propertySubmissionId: row.propertySubmissionId?._id || row.propertySubmissionId, userId })
            .sort({ createdAt: -1 })
            .lean();
        return {
            ...row,
            latestAnalysis: latest
                ? {
                    score: latest.score,
                    signal: latest.signal,
                    opportunityScore: latest.fullAnalysis?.opportunityScore,
                    freshnessScore: latest.fullAnalysis?.freshnessScore,
                    sourceConfidence: latest.sourceConfidence || latest.fullAnalysis?.sourceConfidence,
                    analysisVersion: latest.analysisVersion || latest.fullAnalysis?.analysisVersion,
                }
                : null,
        };
    }));
    return res.json(enriched);
};
exports.getWatchlist = getWatchlist;
const createWatchlistItem = async (req, res) => {
    const userId = userObjectId(req);
    const { propertyId } = req.body;
    if (!propertyId || !mongoose_1.default.Types.ObjectId.isValid(propertyId)) {
        return res.status(400).json({ error: 'Geçersiz propertyId' });
    }
    const property = await PropertySubmission_1.default.findOne({ _id: propertyId, userId }).lean();
    if (!property)
        return res.status(404).json({ error: 'Mülk bulunamadı' });
    const created = await Watchlist_1.default.findOneAndUpdate({ userId, propertySubmissionId: property._id }, { $set: { status: 'ACTIVE' }, $setOnInsert: { userId, propertySubmissionId: property._id } }, { new: true, upsert: true }).lean();
    return res.json(created);
};
exports.createWatchlistItem = createWatchlistItem;
const deleteWatchlistItem = async (req, res) => {
    const userId = userObjectId(req);
    const doc = await Watchlist_1.default.findOneAndDelete({ _id: req.params.id, userId }).lean();
    if (!doc)
        return res.status(404).json({ error: 'Kayıt bulunamadı' });
    return res.json({ ok: true });
};
exports.deleteWatchlistItem = deleteWatchlistItem;
const getPortfolioSummary = async (req, res) => {
    const userId = userObjectId(req);
    const [portfolios, items] = await Promise.all([
        Portfolio_1.default.find({ userId }).sort({ createdAt: -1 }).lean(),
        PortfolioItem_1.default.find({ userId }).lean(),
    ]);
    const counts = {};
    items.forEach((item) => {
        const key = String(item.portfolioId);
        counts[key] = (counts[key] || 0) + 1;
    });
    return res.json(portfolios.map((p) => ({
        ...p,
        itemCount: counts[String(p._id)] || 0,
    })));
};
exports.getPortfolioSummary = getPortfolioSummary;
