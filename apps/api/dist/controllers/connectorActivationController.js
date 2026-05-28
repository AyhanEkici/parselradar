"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGeoDiagnostics = exports.getGeoLayers = exports.getAdminGeoDiagnostics = exports.getAdminLayerHealth = exports.patchAdminLayerVisibility = exports.getAdminLayers = exports.postAdminTucbsSync = exports.getAdminOgcConnectors = exports.getAdminTucbsConnector = exports.patchAdminConnectorSourceApproval = exports.getAdminConnectorAuditByKey = exports.postAdminConnectorDeactivate = exports.postAdminConnectorActivate = exports.postAdminConnectorTestV19 = exports.getAdminConnectorActivationState = exports.postAdminConnectorCredentials = exports.getAdminConnectorAuditTrail = exports.getAdminConnectorActivationPlan = exports.postAdminConnectorTest = exports.getAdminConnectorByKey = exports.postAdminConnectorScheduledSync = exports.postAdminConnectorSyncNow = exports.getAdminConnectorCenter = exports.getAdminConnectorCatalog = exports.getAdminSourceRegistry = exports.getAdminConnectors = void 0;
const connectorRegistry_1 = require("../connectors/connectorRegistry");
const connectorExecutionRegistry_1 = require("../connectors/connectorExecutionRegistry");
const buildConnectorReadiness_1 = require("../services/connectorActivation/buildConnectorReadiness");
const buildLegalSourceRegistry_1 = require("../services/connectorActivation/buildLegalSourceRegistry");
const validateConnectorCredentials_1 = require("../services/connectorActivation/validateConnectorCredentials");
const runConnectorHealthCheck_1 = require("../services/connectorActivation/runConnectorHealthCheck");
const buildConnectorActivationPlan_1 = require("../services/connectorActivation/buildConnectorActivationPlan");
const buildConnectorAuditTrail_1 = require("../services/connectorActivation/buildConnectorAuditTrail");
const connectorStatus_1 = require("../connectors/connectorStatus");
const sourceLegalRequirements_1 = require("../config/connectors/sourceLegalRequirements");
const storeConnectorCredentialProfile_1 = require("../services/connectorActivation/storeConnectorCredentialProfile");
const getConnectorActivationState_1 = require("../services/connectorActivation/getConnectorActivationState");
const executeConnectorTestRun_1 = require("../services/connectorActivation/executeConnectorTestRun");
const activateConnectorIfEligible_1 = require("../services/connectorActivation/activateConnectorIfEligible");
const deactivateConnector_1 = require("../services/connectorActivation/deactivateConnector");
const buildConnectorActivationAudit_1 = require("../services/connectorActivation/buildConnectorActivationAudit");
const ConnectorSourceApproval_1 = __importDefault(require("../models/ConnectorSourceApproval"));
const auditLog_1 = require("../utils/auditLog");
const tucbsLayerCatalog_1 = require("../connectors/tucbs/tucbsLayerCatalog");
const sourceRegistryCatalog_1 = require("../config/connectors/sourceRegistryCatalog");
const connectorSyncEngine_1 = require("../services/connectorActivation/connectorSyncEngine");
const getAdminConnectors = async (_req, res) => {
    const readiness = (0, buildConnectorReadiness_1.buildConnectorReadiness)();
    const legalRegistry = (0, buildLegalSourceRegistry_1.buildLegalSourceRegistry)();
    return res.json({
        generatedAt: new Date().toISOString(),
        connectors: readiness.connectors,
        summary: readiness.summary,
        legalRegistry,
    });
};
exports.getAdminConnectors = getAdminConnectors;
const getAdminSourceRegistry = async (_req, res) => {
    return res.json({
        generatedAt: new Date().toISOString(),
        sources: sourceRegistryCatalog_1.CONNECTOR_SOURCE_REGISTRY,
    });
};
exports.getAdminSourceRegistry = getAdminSourceRegistry;
const getAdminConnectorCatalog = async (_req, res) => {
    const entries = sourceRegistryCatalog_1.CONNECTOR_SOURCE_REGISTRY.map((source) => ({
        connectorKey: source.connectorKey,
        sourceName: source.sourceName,
        provider: source.provider,
        municipality: source.municipality || null,
        province: source.province || null,
        district: source.district || null,
        sourceType: source.sourceType,
        services: source.services,
        mode: source.legalMode,
        sourceStatus: source.status,
        accessStatus: source.accessStatus,
        activationState: source.activationState,
        legalClassification: source.legalClassification,
        blockedReason: source.blockedReason,
    }));
    return res.json({
        generatedAt: new Date().toISOString(),
        entries,
    });
};
exports.getAdminConnectorCatalog = getAdminConnectorCatalog;
const getAdminConnectorCenter = async (_req, res) => {
    const center = await (0, connectorSyncEngine_1.buildAdminConnectorCenter)();
    return res.json(center);
};
exports.getAdminConnectorCenter = getAdminConnectorCenter;
const postAdminConnectorSyncNow = async (req, res) => {
    const connector = (0, connectorRegistry_1.findConnectorByKey)(req.params.connectorKey);
    const sourceRegistry = (0, sourceRegistryCatalog_1.findConnectorSourceRegistry)(req.params.connectorKey);
    if (!connector && !sourceRegistry)
        return res.status(404).json({ error: 'Connector not found' });
    const run = await (0, connectorSyncEngine_1.runConnectorSyncNow)(req.params.connectorKey, req.user?._id?.toString(), 'MANUAL');
    await (0, auditLog_1.logAuditEvent)({
        type: 'connector_sync_run',
        actorUserId: req.user._id.toString(),
        actorRole: req.user.role,
        targetType: 'Connector',
        targetId: req.params.connectorKey,
        message: `Connector sync now executed for ${req.params.connectorKey}`,
        metadata: {
            source: sourceRegistry?.sourceName,
            sourceUrl: sourceRegistry?.officialUrl,
            status: run.status,
            triggerMode: run.triggerMode,
            responseSummary: run.responseSummary,
            error: run.error,
        },
        ip: req.ip,
        userAgent: req.get('user-agent'),
        success: run.status === 'SUCCESS',
    });
    return res.json({
        connectorKey: req.params.connectorKey,
        run: {
            status: run.status,
            startedAt: run.startedAt,
            finishedAt: run.finishedAt,
            error: run.error || null,
            responseSummary: run.responseSummary || null,
        },
    });
};
exports.postAdminConnectorSyncNow = postAdminConnectorSyncNow;
const postAdminConnectorScheduledSync = async (req, res) => {
    const actorUserId = req.user?._id?.toString();
    const actorRole = req.user?.role || 'SYSTEM';
    const result = await (0, connectorSyncEngine_1.runScheduledMetadataSync)(actorUserId);
    await (0, auditLog_1.logAuditEvent)({
        type: 'connector_scheduled_sync_run',
        actorUserId: actorUserId || 'system_cron',
        actorRole,
        targetType: 'Connector',
        targetId: 'scheduled_metadata_sync',
        message: 'Scheduled metadata sync endpoint executed',
        metadata: {
            summary: {
                totalSources: result.totalSources,
                eligible: result.eligible,
                skipped: result.skipped,
                passed: result.passed,
                failed: result.failed,
                noPropertyLevelVerification: true,
            },
        },
        ip: req.ip,
        userAgent: req.get('user-agent'),
        success: result.failed === 0,
    });
    return res.json(result);
};
exports.postAdminConnectorScheduledSync = postAdminConnectorScheduledSync;
const getAdminConnectorByKey = async (req, res) => {
    const connector = (0, connectorRegistry_1.findConnectorByKey)(req.params.connectorKey);
    if (!connector)
        return res.status(404).json({ error: 'Connector not found' });
    const status = (0, connectorStatus_1.connectorStatus)(connector);
    const credentials = (0, validateConnectorCredentials_1.validateConnectorCredentials)(connector);
    const activationPlan = (0, buildConnectorActivationPlan_1.buildConnectorActivationPlan)(connector);
    return res.json({
        connector: {
            ...connector,
            legalRequirement: sourceLegalRequirements_1.SOURCE_LEGAL_REQUIREMENTS[connector.legalRequirementKey],
        },
        status,
        credentials,
        activationPlan,
    });
};
exports.getAdminConnectorByKey = getAdminConnectorByKey;
const postAdminConnectorTest = async (req, res) => {
    const connector = (0, connectorRegistry_1.findConnectorByKey)(req.params.connectorKey);
    if (!connector)
        return res.status(404).json({ error: 'Connector not found' });
    const healthCheck = await (0, runConnectorHealthCheck_1.runConnectorHealthCheck)(connector);
    return res.json(healthCheck);
};
exports.postAdminConnectorTest = postAdminConnectorTest;
const getAdminConnectorActivationPlan = async (req, res) => {
    const connector = (0, connectorRegistry_1.findConnectorByKey)(req.params.connectorKey);
    if (!connector)
        return res.status(404).json({ error: 'Connector not found' });
    const plan = (0, buildConnectorActivationPlan_1.buildConnectorActivationPlan)(connector);
    return res.json(plan);
};
exports.getAdminConnectorActivationPlan = getAdminConnectorActivationPlan;
const getAdminConnectorAuditTrail = async (_req, res) => {
    const audits = await (0, buildConnectorAuditTrail_1.buildConnectorAuditTrail)();
    return res.json({
        connectorsTracked: connectorRegistry_1.CONNECTOR_REGISTRY.map((c) => c.key),
        ...audits,
    });
};
exports.getAdminConnectorAuditTrail = getAdminConnectorAuditTrail;
// V19: POST /admin/connectors/:connectorKey/credentials
// Stores credential presence mask — never raw secrets.
// Body: { presentKeys: string[] } — list of env var names that ARE present
const postAdminConnectorCredentials = async (req, res) => {
    const { connectorKey } = req.params;
    const connector = (0, connectorRegistry_1.findConnectorByKey)(connectorKey);
    const execution = (0, connectorExecutionRegistry_1.findConnectorExecution)(connectorKey);
    if (!connector || !execution)
        return res.status(404).json({ error: 'Connector not found' });
    const presentKeys = req.body?.presentKeys;
    if (!Array.isArray(presentKeys) || presentKeys.some((k) => typeof k !== 'string')) {
        return res.status(400).json({ error: 'presentKeys must be an array of strings' });
    }
    const result = await (0, storeConnectorCredentialProfile_1.storeConnectorCredentialProfile)({
        connectorKey,
        presentKeys: presentKeys,
        allRequiredKeys: execution.requiredEnv,
        userId: req.user._id.toString(),
        ip: req.ip,
    });
    return res.json(result);
};
exports.postAdminConnectorCredentials = postAdminConnectorCredentials;
// V19: GET /admin/connectors/:connectorKey — enhanced with activation state
const getAdminConnectorActivationState = async (req, res) => {
    const connector = (0, connectorRegistry_1.findConnectorByKey)(req.params.connectorKey);
    if (!connector)
        return res.status(404).json({ error: 'Connector not found' });
    const [activationState, credentials, activationPlan] = await Promise.all([
        (0, getConnectorActivationState_1.getConnectorActivationState)(req.params.connectorKey),
        (0, validateConnectorCredentials_1.validateConnectorCredentials)(connector),
        (0, buildConnectorActivationPlan_1.buildConnectorActivationPlan)(connector),
    ]);
    return res.json({
        connector: {
            ...connector,
            legalRequirement: sourceLegalRequirements_1.SOURCE_LEGAL_REQUIREMENTS[connector.legalRequirementKey],
        },
        status: (0, connectorStatus_1.connectorStatus)(connector),
        activationState,
        credentials,
        activationPlan,
    });
};
exports.getAdminConnectorActivationState = getAdminConnectorActivationState;
// V19: POST /admin/connectors/:connectorKey/test
const postAdminConnectorTestV19 = async (req, res) => {
    const connector = (0, connectorRegistry_1.findConnectorByKey)(req.params.connectorKey);
    if (!connector)
        return res.status(404).json({ error: 'Connector not found' });
    const result = await (0, executeConnectorTestRun_1.executeConnectorTestRun)({
        connectorKey: req.params.connectorKey,
        userId: req.user._id.toString(),
        ip: req.ip,
    });
    return res.json(result);
};
exports.postAdminConnectorTestV19 = postAdminConnectorTestV19;
// V19: POST /admin/connectors/:connectorKey/activate
const postAdminConnectorActivate = async (req, res) => {
    const connector = (0, connectorRegistry_1.findConnectorByKey)(req.params.connectorKey);
    if (!connector)
        return res.status(404).json({ error: 'Connector not found' });
    const result = await (0, activateConnectorIfEligible_1.activateConnectorIfEligible)({
        connectorKey: req.params.connectorKey,
        userId: req.user._id.toString(),
        ip: req.ip,
    });
    if (!result.activated) {
        return res.status(422).json({ error: result.reason });
    }
    return res.json(result);
};
exports.postAdminConnectorActivate = postAdminConnectorActivate;
// V19: POST /admin/connectors/:connectorKey/deactivate
const postAdminConnectorDeactivate = async (req, res) => {
    const connector = (0, connectorRegistry_1.findConnectorByKey)(req.params.connectorKey);
    if (!connector)
        return res.status(404).json({ error: 'Connector not found' });
    const result = await (0, deactivateConnector_1.deactivateConnector)({
        connectorKey: req.params.connectorKey,
        userId: req.user._id.toString(),
        ip: req.ip,
    });
    if (!result.deactivated) {
        return res.status(422).json({ error: result.reason });
    }
    return res.json(result);
};
exports.postAdminConnectorDeactivate = postAdminConnectorDeactivate;
// V19: GET /admin/connectors/:connectorKey/audit
const getAdminConnectorAuditByKey = async (req, res) => {
    const connector = (0, connectorRegistry_1.findConnectorByKey)(req.params.connectorKey);
    if (!connector)
        return res.status(404).json({ error: 'Connector not found' });
    const audit = await (0, buildConnectorActivationAudit_1.buildConnectorActivationAudit)(req.params.connectorKey);
    return res.json(audit);
};
exports.getAdminConnectorAuditByKey = getAdminConnectorAuditByKey;
// V19: PATCH /admin/connectors/:connectorKey/source-approval
// Body: { approved: boolean, note?: string }
const patchAdminConnectorSourceApproval = async (req, res) => {
    const connector = (0, connectorRegistry_1.findConnectorByKey)(req.params.connectorKey);
    if (!connector)
        return res.status(404).json({ error: 'Connector not found' });
    const { approved, note } = req.body ?? {};
    if (typeof approved !== 'boolean') {
        return res.status(400).json({ error: 'approved must be a boolean' });
    }
    const record = await ConnectorSourceApproval_1.default.findOneAndUpdate({ connectorKey: req.params.connectorKey }, {
        connectorKey: req.params.connectorKey,
        approved,
        approvedByUserId: req.user._id.toString(),
        approvedAt: approved ? new Date() : undefined,
        note: typeof note === 'string' ? note : undefined,
    }, { upsert: true, new: true });
    await (0, auditLog_1.logAuditEvent)({
        type: 'connector_source_approval_updated',
        actorUserId: req.user._id.toString(),
        targetType: 'Connector',
        targetId: req.params.connectorKey,
        message: `Source approval ${approved ? 'granted' : 'revoked'} for connector: ${req.params.connectorKey}`,
        metadata: { connectorKey: req.params.connectorKey, approved },
        ip: req.ip,
        success: true,
    });
    return res.json({
        connectorKey: record.connectorKey,
        approved: record.approved,
        approvedAt: record.approvedAt,
        note: record.note,
    });
};
exports.patchAdminConnectorSourceApproval = patchAdminConnectorSourceApproval;
// P3: GET /admin/connectors/tucbs
const getAdminTucbsConnector = async (_req, res) => {
    const connector = (0, connectorRegistry_1.findConnectorByKey)('tucbs_ogc');
    if (!connector)
        return res.status(404).json({ error: 'TUCBS connector not registered' });
    const [activationState, catalog] = await Promise.all([
        (0, getConnectorActivationState_1.getConnectorActivationState)('tucbs_ogc'),
        (0, tucbsLayerCatalog_1.getTucbsLayerCatalog)(),
    ]);
    return res.json({
        provider: 'tucbs_public_geo_layers',
        mode: 'READ_ONLY_GEO_LAYERS',
        connector: {
            ...connector,
            legalRequirement: sourceLegalRequirements_1.SOURCE_LEGAL_REQUIREMENTS[connector.legalRequirementKey],
        },
        activationState,
        diagnostics: catalog.diagnostics,
    });
};
exports.getAdminTucbsConnector = getAdminTucbsConnector;
// P3: GET /admin/connectors/ogc
const getAdminOgcConnectors = async (_req, res) => {
    const catalog = await (0, tucbsLayerCatalog_1.getTucbsLayerCatalog)();
    return res.json({
        provider: 'tucbs_public_geo_layers',
        mode: 'READ_ONLY_GEO_LAYERS',
        services: catalog.diagnostics?.services || [],
    });
};
exports.getAdminOgcConnectors = getAdminOgcConnectors;
// P3: POST /admin/connectors/tucbs/sync
const postAdminTucbsSync = async (req, res) => {
    const result = await (0, tucbsLayerCatalog_1.syncTucbsLayerCatalog)();
    await (0, auditLog_1.logAuditEvent)({
        type: 'connector_tucbs_sync',
        actorUserId: req.user._id.toString(),
        actorRole: req.user.role,
        targetType: 'Connector',
        targetId: 'tucbs_ogc',
        message: 'TUCBS layer catalog sync executed',
        metadata: {
            mode: 'READ_ONLY_GEO_LAYERS',
            layerCount: result.layers.length,
            availability: result.diagnostics?.availability,
        },
        ip: req.ip,
        userAgent: req.get('user-agent'),
        success: true,
    });
    return res.json(result);
};
exports.postAdminTucbsSync = postAdminTucbsSync;
// P3: GET /admin/layers
const getAdminLayers = async (_req, res) => {
    const catalog = await (0, tucbsLayerCatalog_1.getTucbsLayerCatalog)();
    return res.json({
        provider: catalog.provider,
        mode: 'READ_ONLY_GEO_LAYERS',
        layers: catalog.layers,
    });
};
exports.getAdminLayers = getAdminLayers;
// P3: PATCH /admin/layers/:layerId/visibility
const patchAdminLayerVisibility = async (req, res) => {
    const { layerId } = req.params;
    const visible = req.body?.visible;
    const opacity = req.body?.opacity;
    const updated = await (0, tucbsLayerCatalog_1.patchLayerVisibility)(layerId, {
        visible: typeof visible === 'boolean' ? visible : undefined,
        opacity: typeof opacity === 'number' ? opacity : undefined,
    });
    await (0, auditLog_1.logAuditEvent)({
        type: 'layer_visibility_updated',
        actorUserId: req.user._id.toString(),
        actorRole: req.user.role,
        targetType: 'Layer',
        targetId: layerId,
        message: 'Layer visibility/opacity updated',
        metadata: {
            readOnly: true,
            visible: updated.visibility,
            opacity: updated.opacity,
        },
        ip: req.ip,
        userAgent: req.get('user-agent'),
        success: true,
    });
    return res.json(updated);
};
exports.patchAdminLayerVisibility = patchAdminLayerVisibility;
// P3: GET /admin/layer-health
const getAdminLayerHealth = async (_req, res) => {
    const health = await (0, tucbsLayerCatalog_1.getTucbsLayerHealth)();
    return res.json({
        mode: 'READ_ONLY_GEO_LAYERS',
        ...health,
    });
};
exports.getAdminLayerHealth = getAdminLayerHealth;
// P3.3: GET /admin/geo-diagnostics
const getAdminGeoDiagnostics = async (_req, res) => {
    const health = await (0, tucbsLayerCatalog_1.getTucbsLayerHealth)();
    return res.json({
        mode: 'READ_ONLY_GEO_LAYERS',
        diagnosticsScope: 'ADMIN',
        generatedAt: new Date().toISOString(),
        ...health,
    });
};
exports.getAdminGeoDiagnostics = getAdminGeoDiagnostics;
// P3.3: GET /geo/layers
const getGeoLayers = async (_req, res) => {
    const catalog = await (0, tucbsLayerCatalog_1.getTucbsLayerCatalog)();
    return res.json({
        provider: catalog.provider,
        mode: 'READ_ONLY_GEO_LAYERS',
        layers: catalog.layers,
    });
};
exports.getGeoLayers = getGeoLayers;
// P3.3: GET /geo/diagnostics
const getGeoDiagnostics = async (_req, res) => {
    const health = await (0, tucbsLayerCatalog_1.getTucbsLayerHealth)();
    return res.json({
        mode: 'READ_ONLY_GEO_LAYERS',
        diagnosticsScope: 'USER',
        generatedAt: new Date().toISOString(),
        ...health,
    });
};
exports.getGeoDiagnostics = getGeoDiagnostics;
