"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shareDealPool = exports.acceptDealPool = exports.updatePropertyStatus = exports.reviewProperty = exports.getPropertyById = exports.getAllProperties = exports.getAdminSecurityOverview = exports.getAdminObservabilitySummary = exports.getAdminStripeDiagnostics = exports.postAdminMailTestEmail = exports.getAdminMailDiagnostics = exports.getAdminRuntimeHealth = exports.getAdminRuntimeOverview = exports.getAdminDeploymentOverview = exports.getAdminStripeSessions = exports.getAdminCreditLedger = exports.getAdminAnalyses = exports.getAdminEmailDeliveryState = exports.updateAdminUserRole = exports.getAdminUsers = void 0;
const authUser_1 = require("../utils/authUser");
const auditLog_1 = require("../utils/auditLog");
const PropertySubmission_1 = __importDefault(require("../models/PropertySubmission"));
const DealPoolEntry_1 = __importDefault(require("../models/DealPoolEntry"));
const DealShareAudit_1 = __importDefault(require("../models/DealShareAudit"));
const ConsentRecord_1 = __importDefault(require("../models/ConsentRecord"));
const User_1 = __importDefault(require("../models/User"));
const AnalysisRun_1 = __importDefault(require("../models/AnalysisRun"));
const CreditLedger_1 = __importDefault(require("../models/CreditLedger"));
const StripeCheckoutSession_1 = __importDefault(require("../models/StripeCheckoutSession"));
const DocumentUpload_1 = __importDefault(require("../models/DocumentUpload"));
const Report_1 = __importDefault(require("../models/Report"));
const AuditEvent_1 = __importDefault(require("../models/AuditEvent"));
const passwordResetEmailService_1 = require("../services/auth/passwordResetEmailService");
const passwordResetEmailService_2 = require("../services/auth/passwordResetEmailService");
const buildOperationalSnapshot_1 = require("../monitoring/buildOperationalSnapshot");
const operationalSecurityDashboard_1 = require("../monitoring/operationalSecurityDashboard");
const threatSignalAggregator_1 = require("../monitoring/threatSignalAggregator");
const governanceComplianceMonitor_1 = require("../governance/governanceComplianceMonitor");
const retentionGovernanceEngine_1 = require("../governance/retentionGovernanceEngine");
const credentialGovernance_1 = require("../governance/credentialGovernance");
const stripeService_1 = require("../services/stripeService");
const operationalIntegrityStore_1 = require("../observability/operationalIntegrityStore");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const toGridFsUrls = (propertyId, documentId) => ({
    fileUrl: `/properties/${propertyId}/documents/${documentId}/view`,
    downloadUrl: `/properties/${propertyId}/documents/${documentId}/download`,
});
const mapCreationSource = (inputMethod) => {
    const value = String(inputMethod || '').toUpperCase();
    if (value.includes('URL') || value.includes('IMPORT'))
        return 'IMPORT';
    if (value.includes('API'))
        return 'API';
    if (value.includes('SCRAP'))
        return 'SCRAPER';
    return 'MANUAL_ENTRY';
};
function readVerifierStatus() {
    const proofDir = path_1.default.resolve(process.cwd(), '../../proof');
    const candidates = [
        'deployment-truth-proof-bundle.json',
        'canonical-auth-validation.json',
        'live-browser-mvp-runtime.json',
        'platform-integrity-audit.json',
        'rbac-proof-bundle.json',
        'mvp-blocker-closure-audit.json',
    ];
    return candidates.map((name) => {
        const filePath = path_1.default.join(proofDir, name);
        if (!fs_1.default.existsSync(filePath)) {
            return { name, status: 'MISSING' };
        }
        try {
            const payload = JSON.parse(fs_1.default.readFileSync(filePath, 'utf8'));
            return {
                name,
                status: String(payload?.overallStatus || payload?.status || 'UNKNOWN').toUpperCase(),
            };
        }
        catch {
            return { name, status: 'UNREADABLE' };
        }
    });
}
// GET /admin/users
const getAdminUsers = async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 25);
    const filter = {};
    if (req.query.role)
        filter.role = req.query.role;
    if (req.query.search) {
        const search = req.query.search;
        filter.$or = [
            { email: { $regex: search, $options: 'i' } },
            { name: { $regex: search, $options: 'i' } }
        ];
    }
    const total = await User_1.default.countDocuments(filter);
    const users = await User_1.default.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-passwordHash');
    // Compute current credit balance for each user
    const usersWithCredits = await Promise.all(users.map(async (u) => {
        const ledger = await CreditLedger_1.default.find({ userId: u._id });
        const currentBalance = ledger.reduce((sum, entry) => sum + entry.amount, 0);
        return {
            ...u.toObject(),
            credits: currentBalance,
        };
    }));
    res.json({ users: usersWithCredits, page, limit, total, totalPages: Math.ceil(total / limit) });
};
exports.getAdminUsers = getAdminUsers;
// PATCH /admin/users/:id/role
const updateAdminUserRole = async (req, res) => {
    const actor = (0, authUser_1.requireAuthUser)(req);
    const targetUserId = String(req.params.id || '').trim();
    const requestedRole = String(req.body?.role || '').trim().toUpperCase();
    if (!targetUserId) {
        return res.status(400).json({ error: 'Geçersiz kullanıcı kimliği' });
    }
    if (requestedRole !== 'ADMIN' && requestedRole !== 'USER') {
        return res.status(400).json({ error: 'Geçersiz rol değeri' });
    }
    const target = await User_1.default.findById(targetUserId).select('email name role createdAt');
    if (!target) {
        return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    const currentRole = String(target.role || '').toUpperCase();
    if (currentRole === requestedRole) {
        return res.json({
            ok: true,
            changed: false,
            message: 'Rol zaten güncel',
            user: {
                _id: String(target._id),
                name: target.name,
                email: target.email,
                role: currentRole,
                createdAt: target.createdAt,
            },
        });
    }
    const actorId = String(actor._id || '');
    const actorRole = String(actor.role || '').toUpperCase();
    // Prevent removing admin from the last remaining admin user.
    if (currentRole === 'ADMIN' && requestedRole === 'USER') {
        const adminCount = await User_1.default.countDocuments({ role: 'ADMIN' });
        if (adminCount <= 1) {
            return res.status(400).json({ error: 'Sistemde en az bir ADMIN kalmalıdır' });
        }
        // Also block self-demotion to reduce accidental lockout.
        if (actorId && String(target._id) === actorId) {
            return res.status(400).json({ error: 'Kendi hesabınızı USER rolüne düşüremezsiniz' });
        }
    }
    target.role = requestedRole;
    await target.save();
    await (0, auditLog_1.logAuditEvent)({
        type: 'admin_user_role_updated',
        actorUserId: actorId,
        actorRole,
        targetType: 'User',
        targetId: String(target._id),
        message: `User role updated to ${requestedRole}`,
        metadata: {
            previousRole: currentRole,
            nextRole: requestedRole,
            targetEmail: target.email,
            targetName: target.name,
        },
        ip: req.ip,
        userAgent: req.get('user-agent'),
        success: true,
    });
    return res.json({
        ok: true,
        changed: true,
        message: 'Rol güncellendi',
        user: {
            _id: String(target._id),
            name: target.name,
            email: target.email,
            role: String(target.role || '').toUpperCase(),
            createdAt: target.createdAt,
        },
    });
};
exports.updateAdminUserRole = updateAdminUserRole;
// GET /admin/email-delivery-state
const getAdminEmailDeliveryState = async (_req, res) => {
    const provider = (0, passwordResetEmailService_1.getPasswordResetEmailProviderState)();
    return res.json({
        state: provider.state,
        configured: provider.configured,
        provider: 'smtp',
        diagnosis: provider.configured ? 'EMAIL_CONFIGURED' : 'EMAIL_NOT_CONFIGURED',
    });
};
exports.getAdminEmailDeliveryState = getAdminEmailDeliveryState;
// GET /admin/analyses
const getAdminAnalyses = async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 25);
    const filter = {};
    if (req.query.userId)
        filter.userId = req.query.userId;
    if (req.query.propertyId)
        filter.propertySubmissionId = req.query.propertyId;
    if (req.query.type)
        filter.productType = req.query.type;
    const total = await AnalysisRun_1.default.countDocuments(filter);
    const analyses = await AnalysisRun_1.default.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'name email role')
        .populate('propertySubmissionId', 'addressText il ilce mahalleOrKoy ada parsel status');
    res.json({ analyses, page, limit, total, totalPages: Math.ceil(total / limit) });
};
exports.getAdminAnalyses = getAdminAnalyses;
// GET /admin/credit-ledger
const getAdminCreditLedger = async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 25);
    const filter = {};
    if (req.query.userId)
        filter.userId = req.query.userId;
    if (req.query.type)
        filter.type = req.query.type;
    const total = await CreditLedger_1.default.countDocuments(filter);
    const ledger = await CreditLedger_1.default.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    res.json({ ledger, page, limit, total, totalPages: Math.ceil(total / limit) });
};
exports.getAdminCreditLedger = getAdminCreditLedger;
// GET /admin/stripe-sessions
const getAdminStripeSessions = async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 25);
    const filter = {};
    if (req.query.userId)
        filter.userId = req.query.userId;
    if (req.query.status)
        filter.status = req.query.status;
    const total = await StripeCheckoutSession_1.default.countDocuments(filter);
    const sessions = await StripeCheckoutSession_1.default.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'name email role');
    res.json({ sessions, page, limit, total, totalPages: Math.ceil(total / limit) });
};
exports.getAdminStripeSessions = getAdminStripeSessions;
// GET /admin/deployment
const getAdminDeploymentOverview = async (_req, res) => {
    const cpuCount = os_1.default.cpus()?.length || 0;
    const memoryMb = Math.round((os_1.default.totalmem?.() || 0) / 1024 / 1024);
    const runningOnRailway = Boolean(process.env.RAILWAY_SERVICE_ID || process.env.RAILWAY_SERVICE_NAME);
    const runningOnVercel = Boolean(process.env.VERCEL);
    res.json({
        deploymentStatus: 'TEMPLATE_ONLY',
        scalingStatus: 'NOT_CONFIGURED',
        backupStatus: 'NOT_CONFIGURED',
        runtimeCapacity: {
            cpuCount,
            memoryMb,
            nodeEnv: process.env.NODE_ENV || 'unknown',
            status: 'STATIC_SNAPSHOT_ONLY',
        },
        deploymentProfile: {
            cloudRuntimeClaim: runningOnRailway ? 'RAILWAY' : runningOnVercel ? 'VERCEL' : 'UNKNOWN',
            deploymentProfile: process.env.NODE_ENV || 'unknown',
            deploymentStateDeclared: 'TEMPLATE_ONLY',
            envReadiness: {
                MONGODB_URI: process.env.MONGODB_URI ? 'PRESENT' : 'MISSING',
                JWT_SECRET: process.env.JWT_SECRET ? 'PRESENT' : 'MISSING',
                CLIENT_URL: process.env.CLIENT_URL ? 'PRESENT' : 'MISSING',
                REDIS_URL: process.env.REDIS_URL ? 'PRESENT' : 'MISSING',
            },
        },
        scalingPolicy: { enabled: false, minReplicas: null, maxReplicas: null, cpuTarget: null },
        backupPolicy: { enabled: false, strategy: 'NONE', schedule: null },
        retentionPolicy: { logsDays: null, backupsDays: null },
        securityAuditSummary: {
            note: 'Static admin deployment overview. No live cloud claims are inferred without explicit runtime signals.',
        },
    });
};
exports.getAdminDeploymentOverview = getAdminDeploymentOverview;
// GET /admin/runtime
const getAdminRuntimeOverview = async (_req, res) => {
    const snapshot = await (0, buildOperationalSnapshot_1.buildOperationalSnapshot)();
    res.json(snapshot);
};
exports.getAdminRuntimeOverview = getAdminRuntimeOverview;
// GET /admin/runtime-health
const getAdminRuntimeHealth = async (_req, res) => {
    const [runtimeSnapshot] = await Promise.all([(0, buildOperationalSnapshot_1.buildOperationalSnapshot)()]);
    const integrity = (0, operationalIntegrityStore_1.getOperationalIntegritySnapshot)();
    res.json({
        generatedAt: new Date().toISOString(),
        runtimeStatus: runtimeSnapshot.runtimeStatus,
        healthSummary: runtimeSnapshot.healthSummary,
        failedRequestSummary: integrity.failedRequestSummary,
        failedRequestsTimeline: integrity.failedRequestsTimeline,
        authFailureSummary: integrity.authFailureSummary,
        retrySummary: integrity.retrySummary,
        runtimeDiagnostics: integrity.runtimeDiagnostics,
        envValidation: integrity.envValidation,
    });
};
exports.getAdminRuntimeHealth = getAdminRuntimeHealth;
// GET /admin/mail-diagnostics
const getAdminMailDiagnostics = async (_req, res) => {
    const provider = (0, passwordResetEmailService_1.getPasswordResetEmailProviderState)();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentFailures = await AuditEvent_1.default.find({
        type: { $in: ['password_reset_email_failed', 'admin_mail_test_failed'] },
        createdAt: { $gte: since },
    })
        .sort({ createdAt: -1 })
        .limit(20)
        .select('createdAt message type')
        .lean();
    res.json({
        generatedAt: new Date().toISOString(),
        provider: 'smtp',
        state: provider.state,
        configured: provider.configured,
        retryQueueDepth: 0,
        failedDeliveriesLast24h: recentFailures.length,
        recentFailures: recentFailures.map((row) => ({
            at: row.createdAt,
            message: `${row.type}: ${row.message}`,
        })),
    });
};
exports.getAdminMailDiagnostics = getAdminMailDiagnostics;
// POST /admin/mail-diagnostics/test-email
const postAdminMailTestEmail = async (req, res) => {
    const actor = (0, authUser_1.requireAuthUser)(req);
    const result = await (0, passwordResetEmailService_2.sendPasswordResetEmail)({
        toEmail: actor.email,
        resetLink: `${process.env.CLIENT_URL || ''}/reset-password?token=admin-test`,
    });
    const success = result.state === 'EMAIL_SENT';
    await (0, auditLog_1.logAuditEvent)({
        type: success ? 'admin_mail_test_sent' : 'admin_mail_test_failed',
        actorUserId: String(actor._id),
        actorRole: String(actor.role),
        targetType: 'MailDiagnostics',
        targetId: String(actor._id),
        message: success ? 'Admin mail test email sent' : 'Admin mail test email failed',
        metadata: { state: result.state },
        ip: req.ip,
        userAgent: req.get('user-agent'),
        success,
    });
    if (!success) {
        return res.status(503).json({ error: 'Mail provider not ready', state: result.state });
    }
    return res.json({ ok: true, state: result.state });
};
exports.postAdminMailTestEmail = postAdminMailTestEmail;
// GET /admin/stripe-diagnostics
const getAdminStripeDiagnostics = async (_req, res) => {
    const stripe = (0, stripeService_1.getStripeRuntimeState)();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [pendingCheckouts, failedAudit] = await Promise.all([
        StripeCheckoutSession_1.default.countDocuments({ status: 'PENDING' }),
        AuditEvent_1.default.find({
            type: { $in: ['stripe_checkout_create', 'stripe_webhook'] },
            success: false,
            createdAt: { $gte: since },
        })
            .sort({ createdAt: -1 })
            .limit(30)
            .select('createdAt message type')
            .lean(),
    ]);
    const failedCheckouts = failedAudit.filter((row) => row.type === 'stripe_checkout_create').length;
    const webhookFailures = failedAudit.filter((row) => row.type === 'stripe_webhook').length;
    res.json({
        generatedAt: new Date().toISOString(),
        state: stripe.mode,
        configured: stripe.configured,
        pendingCheckouts,
        failedCheckoutsLast24h: failedCheckouts,
        webhookFailuresLast24h: webhookFailures,
        recentFailures: failedAudit.map((row) => ({
            at: row.createdAt,
            type: row.type,
            message: row.message,
        })),
    });
};
exports.getAdminStripeDiagnostics = getAdminStripeDiagnostics;
// GET /admin/observability-summary
const getAdminObservabilitySummary = async (_req, res) => {
    const integrity = (0, operationalIntegrityStore_1.getOperationalIntegritySnapshot)();
    res.json({
        generatedAt: new Date().toISOString(),
        runtimeDiagnostics: integrity.runtimeDiagnostics,
        apiErrorCounters: {
            total: integrity.failedRequestSummary.totalFailedRequests,
            byStatus: integrity.failedRequestSummary.statusCounters,
        },
        verifierStatus: readVerifierStatus(),
        connectorRuntimeState: [],
        retrySummary: integrity.retrySummary,
        envValidation: integrity.envValidation,
    });
};
exports.getAdminObservabilitySummary = getAdminObservabilitySummary;
// GET /admin/security-overview
const getAdminSecurityOverview = async (_req, res) => {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [recentAudits, recentUploads, recentReports] = await Promise.all([
        AuditEvent_1.default.find({ createdAt: { $gte: dayAgo } }).sort({ createdAt: -1 }).limit(50).lean(),
        DocumentUpload_1.default.countDocuments({ uploadedAt: { $gte: dayAgo } }),
        Report_1.default.countDocuments({ createdAt: { $gte: dayAgo } }),
    ]);
    const suspiciousSignals = recentAudits.filter((event) => !event.success).length;
    const blockedEvents = recentAudits.filter((event) => String(event.type || '').toLowerCase().includes('deny')).length;
    const threat = (0, threatSignalAggregator_1.threatSignalAggregator)({
        abuseScore: suspiciousSignals * 5,
        sessionScore: blockedEvents * 8,
        exportRiskScore: Math.min(100, recentReports),
    });
    const dashboard = (0, operationalSecurityDashboard_1.operationalSecurityDashboard)({
        threatSignals: suspiciousSignals,
        blockedEvents,
        suspiciousSessions: Math.min(25, suspiciousSignals),
        incidents: recentAudits.slice(0, 10).map((event) => ({
            id: String(event._id),
            severity: event.success ? 'LOW' : 'CRITICAL',
            createdAt: event.createdAt instanceof Date ? event.createdAt.toISOString() : String(event.createdAt),
        })),
    });
    const retention = (0, retentionGovernanceEngine_1.retentionGovernanceEngine)({ auditDays: 90, exportDays: 30, minimumAuditDays: 90 });
    const credentials = (0, credentialGovernance_1.credentialGovernance)({ hasRotationPolicy: true, rotatedWithinDays: 30, maxAgeDays: 90 });
    const governance = (0, governanceComplianceMonitor_1.governanceComplianceMonitor)({
        controls: [
            { key: 'audit_retention', compliant: retention.compliant },
            { key: 'credential_rotation', compliant: credentials.compliant },
            { key: 'access_audit', compliant: true },
        ],
    });
    res.json({
        generatedAt: new Date().toISOString(),
        recentUploads,
        recentReports,
        threat,
        dashboard,
        governance,
        retention,
        credentials,
    });
};
exports.getAdminSecurityOverview = getAdminSecurityOverview;
const getAllProperties = async (req, res) => {
    const properties = await PropertySubmission_1.default.find();
    res.json(properties);
};
exports.getAllProperties = getAllProperties;
const getPropertyById = async (req, res) => {
    const property = await PropertySubmission_1.default.findById(req.params.id).lean();
    if (!property)
        return res.status(404).json({ error: 'Bulunamadı' });
    const [owner, documents, analyses, audits] = await Promise.all([
        User_1.default.findById(property.userId).select('email name role').lean(),
        DocumentUpload_1.default.find({ propertySubmissionId: property._id })
            .sort({ uploadedAt: -1 })
            .select('documentType originalName storedName storedPath gridFsFileId uploadedAt mimeType sizeBytes')
            .lean(),
        AnalysisRun_1.default.find({ propertySubmissionId: property._id })
            .sort({ createdAt: -1 })
            .select('productType score signal confidence strengths risks missingInputs recommendation factorsUsed createdAt previewSummary fullAnalysis')
            .lean(),
        AuditEvent_1.default.find({
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
    const enrichedAnalyses = analyses.map((analysis) => {
        const full = (analysis.fullAnalysis || {});
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
            autonomyIntelligence: full.autonomyIntelligence,
            executionOperatingSystem: full.executionOperatingSystem,
        };
    });
    const latestByType = (type, altType) => enrichedAnalyses.find((a) => a.productType === type || (altType ? a.productType === altType : false)) || null;
    const latestAnalysis = enrichedAnalyses[0] || null;
    const visibleDocuments = documents.map((doc) => ({
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
    res.json({
        property,
        owner,
        creator: owner,
        creationSource: mapCreationSource(property.inputMethod),
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
exports.getPropertyById = getPropertyById;
const reviewProperty = async (req, res) => {
    const property = await PropertySubmission_1.default.findById(req.params.id);
    if (!property)
        return res.status(404).json({ error: 'Bulunamadı' });
    Object.assign(property, req.body);
    await property.save();
    res.json(property);
};
exports.reviewProperty = reviewProperty;
const updatePropertyStatus = async (req, res) => {
    const user = (0, authUser_1.requireAuthUser)(req);
    const allowedStatuses = ['NEW', 'REVIEWING', 'APPROVED', 'REJECTED'];
    const { status } = req.body;
    if (!status || !allowedStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Allowed: ${allowedStatuses.join(', ')}` });
    }
    const property = await PropertySubmission_1.default.findById(req.params.id);
    if (!property)
        return res.status(404).json({ error: 'Mülk bulunamadı' });
    const previousStatus = property.status || 'NEW';
    property.status = status;
    await property.save();
    await (0, auditLog_1.logAuditEvent)({
        type: 'property_status_updated',
        actorUserId: user._id.toString(),
        actorRole: user.role,
        targetType: 'PropertySubmission',
        targetId: String(property._id),
        message: `Property status changed from ${previousStatus} to ${status}`,
        metadata: {
            previousStatus,
            newStatus: status,
            propertyAddress: property.addressText,
        },
        ip: req.ip,
        userAgent: req.get('user-agent'),
        success: true,
    });
    res.json(property);
};
exports.updatePropertyStatus = updatePropertyStatus;
const acceptDealPool = async (req, res) => {
    const property = await PropertySubmission_1.default.findById(req.params.propertyId);
    if (!property)
        return res.status(404).json({ error: 'Bulunamadı' });
    const consent = await ConsentRecord_1.default.findOne({ propertySubmissionId: property._id });
    if (!consent?.allowDealPoolEvaluation || !consent?.allowContactForMatching)
        return res.status(400).json({ error: 'Deal Pool izni yok' });
    const entry = await DealPoolEntry_1.default.create({ propertySubmissionId: property._id, userId: property.userId, status: 'ACCEPTED', matchCategories: [] });
    res.json(entry);
};
exports.acceptDealPool = acceptDealPool;
const shareDealPool = async (req, res) => {
    const entry = await DealPoolEntry_1.default.findById(req.params.entryId);
    if (!entry)
        return res.status(404).json({ error: 'Deal Pool girişi bulunamadı' });
    // Consent check and audit
    const consent = await ConsentRecord_1.default.findOne({ propertySubmissionId: entry.propertySubmissionId });
    if (!consent?.allowDealPoolEvaluation || !consent?.allowContactForMatching)
        return res.status(400).json({ error: 'Paylaşım izni yok' });
    const adminUser = (0, authUser_1.requireAuthUser)(req);
    await DealShareAudit_1.default.create({ dealPoolEntryId: entry._id, sharedWithType: req.body.sharedWithType, sharedWithName: req.body.sharedWithName, sharedWithContact: req.body.sharedWithContact, sharedFields: req.body.sharedFields, adminUserId: adminUser._id });
    res.json({ ok: true });
};
exports.shareDealPool = shareDealPool;
