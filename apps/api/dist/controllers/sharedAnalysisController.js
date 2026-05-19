"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSharedAnalyses = exports.createSharedAnalysis = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const OrganizationMember_1 = __importDefault(require("../models/OrganizationMember"));
const SharedAnalysis_1 = __importDefault(require("../models/SharedAnalysis"));
const AnalysisRun_1 = __importDefault(require("../models/AnalysisRun"));
const PropertySubmission_1 = __importDefault(require("../models/PropertySubmission"));
const WorkspaceActivity_1 = __importDefault(require("../models/WorkspaceActivity"));
const resolveWorkspacePermissions_1 = require("../services/organizations/resolveWorkspacePermissions");
function requestUserId(req) {
    return new mongoose_1.default.Types.ObjectId(String(req.user?._id));
}
async function requireMembership(organizationId, userId) {
    return OrganizationMember_1.default.findOne({ organizationId, userId, status: 'ACTIVE' }).lean();
}
const createSharedAnalysis = async (req, res) => {
    const userId = requestUserId(req);
    const organizationId = req.params.organizationId;
    const membership = await requireMembership(organizationId, userId);
    if (!membership || !(0, resolveWorkspacePermissions_1.canPerformWorkspaceAction)(membership.role, 'shared-analysis:create')) {
        return res.status(403).json({ error: 'Shared analysis oluşturma yetkisi yok' });
    }
    const { propertyId, comment } = req.body;
    if (!propertyId || !mongoose_1.default.Types.ObjectId.isValid(propertyId)) {
        return res.status(400).json({ error: 'Geçersiz propertyId' });
    }
    const [property, latestAnalysis] = await Promise.all([
        PropertySubmission_1.default.findById(propertyId).lean(),
        AnalysisRun_1.default.findOne({ propertySubmissionId: propertyId }).sort({ createdAt: -1 }).lean(),
    ]);
    if (!property)
        return res.status(404).json({ error: 'Mülk bulunamadı' });
    if (!latestAnalysis)
        return res.status(404).json({ error: 'Analiz bulunamadı' });
    const row = await SharedAnalysis_1.default.findOneAndUpdate({
        organizationId,
        propertySubmissionId: property._id,
        analysisRunId: latestAnalysis._id,
    }, {
        $set: { comment: comment || '' },
        $setOnInsert: {
            organizationId,
            propertySubmissionId: property._id,
            analysisRunId: latestAnalysis._id,
            sharedByUserId: userId,
        },
    }, { new: true, upsert: true }).lean();
    await WorkspaceActivity_1.default.create({
        organizationId,
        actorUserId: userId,
        action: 'shared_analysis_created',
        entityType: 'shared_analysis',
        entityId: row?._id,
        metadata: {
            propertyId: String(property._id),
            analysisRunId: String(latestAnalysis._id),
        },
    });
    return res.json(row);
};
exports.createSharedAnalysis = createSharedAnalysis;
const getSharedAnalyses = async (req, res) => {
    const userId = requestUserId(req);
    const organizationId = req.params.organizationId;
    const membership = await requireMembership(organizationId, userId);
    if (!membership || !(0, resolveWorkspacePermissions_1.canPerformWorkspaceAction)(membership.role, 'shared-analysis:read')) {
        return res.status(403).json({ error: 'Shared analysis görüntüleme yetkisi yok' });
    }
    const rows = await SharedAnalysis_1.default.find({ organizationId })
        .sort({ createdAt: -1 })
        .populate('propertySubmissionId', 'addressText il ilce askingPriceTRY areaM2')
        .populate('analysisRunId', 'score signal sourceConfidence analysisVersion fullAnalysis.freshnessScore fullAnalysis.opportunityScore')
        .populate('sharedByUserId', 'name email')
        .lean();
    return res.json({
        permissions: (0, resolveWorkspacePermissions_1.resolveWorkspacePermissions)(membership.role),
        rows,
    });
};
exports.getSharedAnalyses = getSharedAnalyses;
