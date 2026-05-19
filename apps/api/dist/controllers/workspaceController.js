"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addWorkspaceWatchlistProperty = exports.addWorkspacePortfolioProperty = exports.getWorkspaceActivity = exports.getWorkspaceWatchlist = exports.getWorkspacePortfolios = exports.getWorkspaceDashboard = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const OrganizationMember_1 = __importDefault(require("../models/OrganizationMember"));
const WorkspacePortfolio_1 = __importDefault(require("../models/WorkspacePortfolio"));
const WorkspaceWatchlist_1 = __importDefault(require("../models/WorkspaceWatchlist"));
const WorkspaceActivity_1 = __importDefault(require("../models/WorkspaceActivity"));
const SharedAnalysis_1 = __importDefault(require("../models/SharedAnalysis"));
const PropertySubmission_1 = __importDefault(require("../models/PropertySubmission"));
const AnalysisRun_1 = __importDefault(require("../models/AnalysisRun"));
const resolveWorkspacePermissions_1 = require("../services/organizations/resolveWorkspacePermissions");
const buildWorkspaceActivityFeed_1 = require("../services/workspace/buildWorkspaceActivityFeed");
const calculateWorkspaceSignals_1 = require("../services/workspace/calculateWorkspaceSignals");
const buildSharedPortfolioSummary_1 = require("../services/workspace/buildSharedPortfolioSummary");
const buildSharedWatchlistSummary_1 = require("../services/workspace/buildSharedWatchlistSummary");
const ownership_1 = require("../utils/ownership");
function requestUserId(req) {
    return new mongoose_1.default.Types.ObjectId(String(req.user?._id));
}
async function requireMembership(organizationId, userId) {
    return OrganizationMember_1.default.findOne({ organizationId, userId, status: 'ACTIVE' }).lean();
}
async function logActivity(input) {
    await WorkspaceActivity_1.default.create({
        organizationId: input.organizationId,
        actorUserId: input.actorUserId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        metadata: input.metadata,
    });
}
const getWorkspaceDashboard = async (req, res) => {
    const userId = requestUserId(req);
    const organizationId = req.params.organizationId;
    const membership = await requireMembership(organizationId, userId);
    if (!membership || !(0, resolveWorkspacePermissions_1.canPerformWorkspaceAction)(membership.role, 'workspace:read')) {
        return res.status(403).json({ error: 'Workspace görüntüleme yetkisi yok' });
    }
    const [portfolioRows, watchlistRows, sharedRows, activities] = await Promise.all([
        WorkspacePortfolio_1.default.find({ organizationId }).sort({ createdAt: -1 }).lean(),
        WorkspaceWatchlist_1.default.find({ organizationId, status: 'ACTIVE' }).sort({ createdAt: -1 }).lean(),
        SharedAnalysis_1.default.find({ organizationId }).sort({ createdAt: -1 }).lean(),
        WorkspaceActivity_1.default.find({ organizationId }).sort({ createdAt: -1 }).limit(50).lean(),
    ]);
    const analysisIds = sharedRows.map((row) => row.analysisRunId);
    const analysisRuns = await AnalysisRun_1.default.find({ _id: { $in: analysisIds } }).lean();
    const signals = (0, calculateWorkspaceSignals_1.calculateWorkspaceSignals)({
        sharedAnalyses: analysisRuns.map((row) => ({
            score: row.score,
            opportunityScore: row.fullAnalysis?.opportunityScore,
            freshnessScore: row.fullAnalysis?.freshnessScore,
        })),
    });
    return res.json({
        permissions: (0, resolveWorkspacePermissions_1.resolveWorkspacePermissions)(membership.role),
        metrics: {
            portfolioCount: portfolioRows.length,
            watchlistCount: watchlistRows.length,
            sharedAnalysisCount: sharedRows.length,
        },
        signals,
        activity: (0, buildWorkspaceActivityFeed_1.buildWorkspaceActivityFeed)({ activities: activities }),
    });
};
exports.getWorkspaceDashboard = getWorkspaceDashboard;
const getWorkspacePortfolios = async (req, res) => {
    const userId = requestUserId(req);
    const organizationId = req.params.organizationId;
    const membership = await requireMembership(organizationId, userId);
    if (!membership || !(0, resolveWorkspacePermissions_1.canPerformWorkspaceAction)(membership.role, 'workspace:read')) {
        return res.status(403).json({ error: 'Shared portfolio görüntüleme yetkisi yok' });
    }
    const rows = await WorkspacePortfolio_1.default.find({ organizationId })
        .sort({ createdAt: -1 })
        .populate('propertySubmissionId', 'addressText il ilce askingPriceTRY areaM2')
        .lean();
    return res.json((0, buildSharedPortfolioSummary_1.buildSharedPortfolioSummary)({ rows: rows }));
};
exports.getWorkspacePortfolios = getWorkspacePortfolios;
const getWorkspaceWatchlist = async (req, res) => {
    const userId = requestUserId(req);
    const organizationId = req.params.organizationId;
    const membership = await requireMembership(organizationId, userId);
    if (!membership || !(0, resolveWorkspacePermissions_1.canPerformWorkspaceAction)(membership.role, 'workspace:read')) {
        return res.status(403).json({ error: 'Shared watchlist görüntüleme yetkisi yok' });
    }
    const rows = await WorkspaceWatchlist_1.default.find({ organizationId, status: 'ACTIVE' })
        .sort({ createdAt: -1 })
        .populate('propertySubmissionId', 'addressText il ilce askingPriceTRY areaM2')
        .lean();
    return res.json((0, buildSharedWatchlistSummary_1.buildSharedWatchlistSummary)({ rows: rows }));
};
exports.getWorkspaceWatchlist = getWorkspaceWatchlist;
const getWorkspaceActivity = async (req, res) => {
    const userId = requestUserId(req);
    const organizationId = req.params.organizationId;
    const membership = await requireMembership(organizationId, userId);
    if (!membership || !(0, resolveWorkspacePermissions_1.canPerformWorkspaceAction)(membership.role, 'workspace:read')) {
        return res.status(403).json({ error: 'Workspace activity görüntüleme yetkisi yok' });
    }
    const rows = await WorkspaceActivity_1.default.find({ organizationId })
        .sort({ createdAt: -1 })
        .limit(100)
        .populate('actorUserId', 'name email')
        .lean();
    return res.json((0, buildWorkspaceActivityFeed_1.buildWorkspaceActivityFeed)({ activities: rows }));
};
exports.getWorkspaceActivity = getWorkspaceActivity;
const addWorkspacePortfolioProperty = async (req, res) => {
    const userId = requestUserId(req);
    const organizationId = req.params.organizationId;
    const membership = await requireMembership(organizationId, userId);
    if (!membership || !(0, resolveWorkspacePermissions_1.canPerformWorkspaceAction)(membership.role, 'workspace:manage')) {
        return res.status(403).json({ error: 'Shared portfolio düzenleme yetkisi yok' });
    }
    const { propertyId, title, note } = req.body;
    if (!propertyId || !mongoose_1.default.Types.ObjectId.isValid(propertyId)) {
        return res.status(400).json({ error: 'Geçersiz propertyId' });
    }
    const property = await PropertySubmission_1.default.findById(propertyId).lean();
    if (!property)
        return res.status(404).json({ error: 'Mülk bulunamadı' });
    if (!(0, ownership_1.isAdmin)(req.user) && String(property.userId) !== String(userId)) {
        return res.status(404).json({ error: 'Mülk bulunamadı' });
    }
    const row = await WorkspacePortfolio_1.default.findOneAndUpdate({
        organizationId,
        title: title || 'Shared Portfolio',
        propertySubmissionId: property._id,
    }, {
        $set: { note: note || '' },
        $setOnInsert: {
            organizationId,
            title: title || 'Shared Portfolio',
            propertySubmissionId: property._id,
            addedByUserId: userId,
        },
    }, { new: true, upsert: true }).lean();
    await logActivity({
        organizationId,
        actorUserId: userId,
        action: 'workspace_portfolio_property_added',
        entityType: 'workspace_portfolio',
        entityId: row?._id,
        metadata: { propertyId: String(property._id), title: title || 'Shared Portfolio' },
    });
    return res.json(row);
};
exports.addWorkspacePortfolioProperty = addWorkspacePortfolioProperty;
const addWorkspaceWatchlistProperty = async (req, res) => {
    const userId = requestUserId(req);
    const organizationId = req.params.organizationId;
    const membership = await requireMembership(organizationId, userId);
    if (!membership || !(0, resolveWorkspacePermissions_1.canPerformWorkspaceAction)(membership.role, 'workspace:manage')) {
        return res.status(403).json({ error: 'Shared watchlist düzenleme yetkisi yok' });
    }
    const { propertyId, note } = req.body;
    if (!propertyId || !mongoose_1.default.Types.ObjectId.isValid(propertyId)) {
        return res.status(400).json({ error: 'Geçersiz propertyId' });
    }
    const property = await PropertySubmission_1.default.findById(propertyId).lean();
    if (!property)
        return res.status(404).json({ error: 'Mülk bulunamadı' });
    if (!(0, ownership_1.isAdmin)(req.user) && String(property.userId) !== String(userId)) {
        return res.status(404).json({ error: 'Mülk bulunamadı' });
    }
    const row = await WorkspaceWatchlist_1.default.findOneAndUpdate({ organizationId, propertySubmissionId: property._id }, {
        $set: { status: 'ACTIVE', note: note || '' },
        $setOnInsert: {
            organizationId,
            propertySubmissionId: property._id,
            addedByUserId: userId,
        },
    }, { new: true, upsert: true }).lean();
    await logActivity({
        organizationId,
        actorUserId: userId,
        action: 'workspace_watchlist_property_added',
        entityType: 'workspace_watchlist',
        entityId: row?._id,
        metadata: { propertyId: String(property._id) },
    });
    return res.json(row);
};
exports.addWorkspaceWatchlistProperty = addWorkspaceWatchlistProperty;
