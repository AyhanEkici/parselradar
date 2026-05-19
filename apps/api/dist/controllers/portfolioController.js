"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePortfolioItem = exports.addPortfolioItem = exports.getPortfolioById = exports.createPortfolio = exports.getPortfolios = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Portfolio_1 = __importDefault(require("../models/Portfolio"));
const PortfolioItem_1 = __importDefault(require("../models/PortfolioItem"));
const PropertySubmission_1 = __importDefault(require("../models/PropertySubmission"));
const AnalysisRun_1 = __importDefault(require("../models/AnalysisRun"));
const createPortfolioSnapshot_1 = require("../services/portfolio/createPortfolioSnapshot");
const calculatePortfolioExposure_1 = require("../services/portfolio/calculatePortfolioExposure");
const calculatePortfolioOpportunityScore_1 = require("../services/portfolio/calculatePortfolioOpportunityScore");
function userObjectId(req) {
    return new mongoose_1.default.Types.ObjectId(String(req.user?._id));
}
const getPortfolios = async (req, res) => {
    const userId = userObjectId(req);
    const portfolios = await Portfolio_1.default.find({ userId }).sort({ createdAt: -1 }).lean();
    return res.json(portfolios);
};
exports.getPortfolios = getPortfolios;
const createPortfolio = async (req, res) => {
    const userId = userObjectId(req);
    const { name, description } = req.body;
    if (!name)
        return res.status(400).json({ error: 'name gerekli' });
    const portfolio = await Portfolio_1.default.create({ userId, name, description });
    return res.json(portfolio);
};
exports.createPortfolio = createPortfolio;
const getPortfolioById = async (req, res) => {
    const userId = userObjectId(req);
    const portfolio = await Portfolio_1.default.findOne({ _id: req.params.id, userId }).lean();
    if (!portfolio)
        return res.status(404).json({ error: 'Portfolio bulunamadı' });
    const items = await PortfolioItem_1.default.find({ portfolioId: portfolio._id, userId }).lean();
    const propertyIds = items.map((i) => i.propertySubmissionId);
    const properties = await PropertySubmission_1.default.find({ _id: { $in: propertyIds } }).lean();
    const latestAnalyses = await Promise.all(propertyIds.map(async (propertyId) => AnalysisRun_1.default.findOne({ propertySubmissionId: propertyId, userId }).sort({ createdAt: -1 }).lean()));
    const analysisByProperty = {};
    latestAnalyses.forEach((analysis) => {
        if (!analysis)
            return;
        analysisByProperty[String(analysis.propertySubmissionId)] = analysis;
    });
    const enrichedItems = items.map((item) => {
        const property = properties.find((p) => String(p._id) === String(item.propertySubmissionId));
        const analysis = analysisByProperty[String(item.propertySubmissionId)];
        return {
            ...item,
            property,
            latestAnalysis: analysis
                ? {
                    score: analysis.score,
                    signal: analysis.signal,
                    opportunityScore: analysis.fullAnalysis?.opportunityScore,
                    freshnessScore: analysis.fullAnalysis?.freshnessScore,
                    sourceConfidence: analysis.sourceConfidence || analysis.fullAnalysis?.sourceConfidence,
                    analysisVersion: analysis.analysisVersion || analysis.fullAnalysis?.analysisVersion,
                    autonomyIntelligence: analysis.fullAnalysis?.autonomyIntelligence || null,
                    operationalIntelligence: analysis.fullAnalysis?.operationalIntelligence || null,
                    executionOperatingSystem: analysis.fullAnalysis?.executionOperatingSystem || null,
                    ingestionGovernance: analysis.fullAnalysis?.ingestionGovernance || null,
                }
                : null,
        };
    });
    const exposure = (0, calculatePortfolioExposure_1.calculatePortfolioExposure)({
        items: enrichedItems.map((item) => ({
            allocationWeight: item.allocationWeight,
            askingPriceTRY: item.property?.askingPriceTRY,
            areaM2: item.property?.areaM2,
            il: item.property?.il,
            ilce: item.property?.ilce,
        })),
    });
    const opportunity = (0, calculatePortfolioOpportunityScore_1.calculatePortfolioOpportunityScore)({
        analyses: enrichedItems
            .map((item) => item.latestAnalysis)
            .filter(Boolean)
            .map((a) => ({
            score: a.score,
            opportunityScore: a.opportunityScore,
            freshnessScore: a.freshnessScore,
        })),
    });
    const snapshot = (0, createPortfolioSnapshot_1.createPortfolioSnapshot)({
        portfolio,
        items: enrichedItems,
        latestAnalyses: enrichedItems.map((item) => item.latestAnalysis).filter(Boolean),
    });
    return res.json({ portfolio, items: enrichedItems, exposure, opportunity, snapshot });
};
exports.getPortfolioById = getPortfolioById;
const addPortfolioItem = async (req, res) => {
    const userId = userObjectId(req);
    const portfolio = await Portfolio_1.default.findOne({ _id: req.params.id, userId }).lean();
    if (!portfolio)
        return res.status(404).json({ error: 'Portfolio bulunamadı' });
    const { propertyId, allocationWeight, thesis } = req.body;
    if (!propertyId || !mongoose_1.default.Types.ObjectId.isValid(propertyId)) {
        return res.status(400).json({ error: 'Geçersiz propertyId' });
    }
    const property = await PropertySubmission_1.default.findOne({ _id: propertyId, userId }).lean();
    if (!property)
        return res.status(404).json({ error: 'Mülk bulunamadı' });
    const item = await PortfolioItem_1.default.findOneAndUpdate({ userId, portfolioId: portfolio._id, propertySubmissionId: property._id }, {
        $set: {
            allocationWeight: allocationWeight || 0,
            thesis: thesis || '',
        },
        $setOnInsert: {
            userId,
            portfolioId: portfolio._id,
            propertySubmissionId: property._id,
        },
    }, { new: true, upsert: true }).lean();
    return res.json(item);
};
exports.addPortfolioItem = addPortfolioItem;
const deletePortfolioItem = async (req, res) => {
    const userId = userObjectId(req);
    const portfolio = await Portfolio_1.default.findOne({ _id: req.params.id, userId }).lean();
    if (!portfolio)
        return res.status(404).json({ error: 'Portfolio bulunamadı' });
    const deleted = await PortfolioItem_1.default.findOneAndDelete({
        _id: req.params.itemId,
        portfolioId: portfolio._id,
        userId,
    }).lean();
    if (!deleted)
        return res.status(404).json({ error: 'Portfolio item bulunamadı' });
    return res.json({ ok: true });
};
exports.deletePortfolioItem = deletePortfolioItem;
