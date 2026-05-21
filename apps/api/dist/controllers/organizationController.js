"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrganizationMember = exports.patchOrganizationMember = exports.addOrganizationMember = exports.getOrganizationById = exports.createOrganization = exports.getOrganizations = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Organization_1 = __importDefault(require("../models/Organization"));
const OrganizationMember_1 = __importDefault(require("../models/OrganizationMember"));
const Workspace_1 = __importDefault(require("../models/Workspace"));
const WorkspacePortfolio_1 = __importDefault(require("../models/WorkspacePortfolio"));
const WorkspaceWatchlist_1 = __importDefault(require("../models/WorkspaceWatchlist"));
const SharedAnalysis_1 = __importDefault(require("../models/SharedAnalysis"));
const PropertySubmission_1 = __importDefault(require("../models/PropertySubmission"));
const resolveWorkspacePermissions_1 = require("../services/organizations/resolveWorkspacePermissions");
const buildOrganizationSummary_1 = require("../services/organizations/buildOrganizationSummary");
const calculateOrganizationExposure_1 = require("../services/organizations/calculateOrganizationExposure");
const createOrganizationSnapshot_1 = require("../services/organizations/createOrganizationSnapshot");
const auditLog_1 = require("../utils/auditLog");
function userId(req) {
    return new mongoose_1.default.Types.ObjectId(String(req.user?._id));
}
async function getActiveMembership(organizationId, requestUserId) {
    return OrganizationMember_1.default.findOne({
        organizationId,
        userId: requestUserId,
        status: 'ACTIVE',
    }).lean();
}
const getOrganizations = async (req, res) => {
    const requestUserId = userId(req);
    const memberships = await OrganizationMember_1.default.find({ userId: requestUserId, status: 'ACTIVE' }).lean();
    const organizationIds = memberships.map((m) => m.organizationId);
    const organizations = await Organization_1.default.find({ _id: { $in: organizationIds }, status: 'ACTIVE' })
        .sort({ createdAt: -1 })
        .lean();
    const counts = await Promise.all(organizations.map(async (org) => ({
        organizationId: String(org._id),
        members: await OrganizationMember_1.default.countDocuments({ organizationId: org._id, status: 'ACTIVE' }),
        sharedAnalyses: await SharedAnalysis_1.default.countDocuments({ organizationId: org._id }),
        sharedPortfolio: await WorkspacePortfolio_1.default.countDocuments({ organizationId: org._id }),
        sharedWatchlist: await WorkspaceWatchlist_1.default.countDocuments({ organizationId: org._id, status: 'ACTIVE' }),
    })));
    const summary = (0, buildOrganizationSummary_1.buildOrganizationSummary)({
        organizationCount: organizations.length,
        totalMembers: counts.reduce((sum, row) => sum + row.members, 0),
        totalSharedAnalyses: counts.reduce((sum, row) => sum + row.sharedAnalyses, 0),
        totalWorkspacePortfolios: counts.reduce((sum, row) => sum + row.sharedPortfolio, 0),
        totalWorkspaceWatchlist: counts.reduce((sum, row) => sum + row.sharedWatchlist, 0),
    });
    return res.json({
        organizations: organizations.map((org) => {
            const membership = memberships.find((m) => String(m.organizationId) === String(org._id));
            const metrics = counts.find((c) => c.organizationId === String(org._id));
            return {
                ...org,
                memberRole: membership?.role,
                memberCount: metrics?.members || 0,
                sharedAnalysesCount: metrics?.sharedAnalyses || 0,
            };
        }),
        summary,
    });
};
exports.getOrganizations = getOrganizations;
const createOrganization = async (req, res) => {
    const requestUserId = userId(req);
    const { name } = req.body;
    if (!name)
        return res.status(400).json({ error: 'name gerekli' });
    const slug = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + `-${Date.now()}`;
    const organization = await Organization_1.default.create({
        name,
        slug,
        createdByUserId: requestUserId,
        status: 'ACTIVE',
    });
    await OrganizationMember_1.default.create({
        organizationId: organization._id,
        userId: requestUserId,
        role: 'OWNER',
        status: 'ACTIVE',
    });
    await Workspace_1.default.create({
        organizationId: organization._id,
        name: 'Main Workspace',
        description: 'Default collaborative workspace',
        createdByUserId: requestUserId,
    });
    await (0, auditLog_1.logAuditEvent)({
        type: 'organization_created',
        actorUserId: String(requestUserId),
        actorRole: String(req.user?.role || ''),
        targetType: 'Organization',
        targetId: String(organization._id),
        message: 'Organization created',
        metadata: { organizationName: name, organizationSlug: slug },
        ip: req.ip,
        userAgent: req.get('user-agent'),
        success: true,
    });
    return res.json(organization);
};
exports.createOrganization = createOrganization;
const getOrganizationById = async (req, res) => {
    const requestUserId = userId(req);
    const membership = await getActiveMembership(req.params.id, requestUserId);
    if (!membership)
        return res.status(403).json({ error: 'Organization erişim yetkisi yok' });
    if (!(0, resolveWorkspacePermissions_1.canPerformWorkspaceAction)(membership.role, 'organization:read')) {
        return res.status(403).json({ error: 'Bu işlem için yetki yok' });
    }
    const [organization, members, sharedPortfolioRows, sharedWatchlistRows, sharedAnalyses] = await Promise.all([
        Organization_1.default.findById(req.params.id).lean(),
        OrganizationMember_1.default.find({ organizationId: req.params.id, status: 'ACTIVE' })
            .populate('userId', 'name email role')
            .lean(),
        WorkspacePortfolio_1.default.find({ organizationId: req.params.id }).lean(),
        WorkspaceWatchlist_1.default.find({ organizationId: req.params.id, status: 'ACTIVE' }).lean(),
        SharedAnalysis_1.default.find({ organizationId: req.params.id }).lean(),
    ]);
    if (!organization)
        return res.status(404).json({ error: 'Organization bulunamadı' });
    const portfolioProperties = await PropertySubmission_1.default.find({
        _id: { $in: sharedPortfolioRows.map((row) => row.propertySubmissionId) },
    }).lean();
    const watchlistProperties = await PropertySubmission_1.default.find({
        _id: { $in: sharedWatchlistRows.map((row) => row.propertySubmissionId) },
    }).lean();
    const exposure = (0, calculateOrganizationExposure_1.calculateOrganizationExposure)({
        portfolios: portfolioProperties.map((p) => ({ askingPriceTRY: p.askingPriceTRY, il: p.il })),
        watchlist: watchlistProperties.map((p) => ({ askingPriceTRY: p.askingPriceTRY })),
    });
    const snapshot = (0, createOrganizationSnapshot_1.createOrganizationSnapshot)({
        organization,
        members: members,
        exposure,
    });
    return res.json({
        organization,
        members,
        permissions: (0, resolveWorkspacePermissions_1.resolveWorkspacePermissions)(membership.role),
        metrics: {
            sharedPortfolioCount: sharedPortfolioRows.length,
            sharedWatchlistCount: sharedWatchlistRows.length,
            sharedAnalysisCount: sharedAnalyses.length,
        },
        exposure,
        snapshot,
    });
};
exports.getOrganizationById = getOrganizationById;
const addOrganizationMember = async (req, res) => {
    const requestUserId = userId(req);
    const organizationId = req.params.id;
    const membership = await getActiveMembership(organizationId, requestUserId);
    if (!membership)
        return res.status(403).json({ error: 'Organization erişim yetkisi yok' });
    if (!(0, resolveWorkspacePermissions_1.canPerformWorkspaceAction)(membership.role, 'organization:manage-members')) {
        return res.status(403).json({ error: 'Üye yönetme yetkisi yok' });
    }
    const { userId: targetUserId, role } = req.body;
    if (!targetUserId || !role || !mongoose_1.default.Types.ObjectId.isValid(targetUserId)) {
        return res.status(400).json({ error: 'Geçersiz userId/role' });
    }
    const doc = await OrganizationMember_1.default.findOneAndUpdate({ organizationId, userId: targetUserId }, {
        $set: { role, status: 'ACTIVE' },
        $setOnInsert: { organizationId, userId: targetUserId, invitedByUserId: requestUserId },
    }, { new: true, upsert: true }).lean();
    await (0, auditLog_1.logAuditEvent)({
        type: 'organization_member_added',
        actorUserId: String(requestUserId),
        actorRole: String(req.user?.role || ''),
        targetType: 'Organization',
        targetId: String(organizationId),
        message: 'Organization member added/activated',
        metadata: { targetUserId, role },
        ip: req.ip,
        userAgent: req.get('user-agent'),
        success: true,
    });
    return res.json(doc);
};
exports.addOrganizationMember = addOrganizationMember;
const patchOrganizationMember = async (req, res) => {
    const requestUserId = userId(req);
    const organizationId = req.params.id;
    const membership = await getActiveMembership(organizationId, requestUserId);
    if (!membership)
        return res.status(403).json({ error: 'Organization erişim yetkisi yok' });
    if (!(0, resolveWorkspacePermissions_1.canPerformWorkspaceAction)(membership.role, 'organization:manage-members')) {
        return res.status(403).json({ error: 'Üye yönetme yetkisi yok' });
    }
    const { role, status } = req.body;
    const updated = await OrganizationMember_1.default.findOneAndUpdate({ _id: req.params.memberId, organizationId }, {
        ...(role ? { role } : {}),
        ...(status ? { status } : {}),
    }, { new: true }).lean();
    if (!updated)
        return res.status(404).json({ error: 'Organization member bulunamadı' });
    await (0, auditLog_1.logAuditEvent)({
        type: 'organization_member_updated',
        actorUserId: String(requestUserId),
        actorRole: String(req.user?.role || ''),
        targetType: 'OrganizationMember',
        targetId: String(req.params.memberId),
        message: 'Organization member updated',
        metadata: { organizationId, role, status },
        ip: req.ip,
        userAgent: req.get('user-agent'),
        success: true,
    });
    return res.json(updated);
};
exports.patchOrganizationMember = patchOrganizationMember;
const deleteOrganizationMember = async (req, res) => {
    const requestUserId = userId(req);
    const organizationId = req.params.id;
    const membership = await getActiveMembership(organizationId, requestUserId);
    if (!membership)
        return res.status(403).json({ error: 'Organization erişim yetkisi yok' });
    if (!(0, resolveWorkspacePermissions_1.canPerformWorkspaceAction)(membership.role, 'organization:manage-members')) {
        return res.status(403).json({ error: 'Üye yönetme yetkisi yok' });
    }
    const deleted = await OrganizationMember_1.default.findOneAndDelete({ _id: req.params.memberId, organizationId }).lean();
    if (!deleted)
        return res.status(404).json({ error: 'Organization member bulunamadı' });
    await (0, auditLog_1.logAuditEvent)({
        type: 'organization_member_deleted',
        actorUserId: String(requestUserId),
        actorRole: String(req.user?.role || ''),
        targetType: 'OrganizationMember',
        targetId: String(req.params.memberId),
        message: 'Organization member deleted',
        metadata: { organizationId },
        ip: req.ip,
        userAgent: req.get('user-agent'),
        success: true,
    });
    return res.json({ ok: true });
};
exports.deleteOrganizationMember = deleteOrganizationMember;
