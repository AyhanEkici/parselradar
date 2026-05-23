import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { CONNECTOR_REGISTRY, findConnectorByKey } from '../connectors/connectorRegistry';
import { findConnectorExecution } from '../connectors/connectorExecutionRegistry';
import { buildConnectorReadiness } from '../services/connectorActivation/buildConnectorReadiness';
import { buildLegalSourceRegistry } from '../services/connectorActivation/buildLegalSourceRegistry';
import { validateConnectorCredentials } from '../services/connectorActivation/validateConnectorCredentials';
import { runConnectorHealthCheck } from '../services/connectorActivation/runConnectorHealthCheck';
import { buildConnectorActivationPlan } from '../services/connectorActivation/buildConnectorActivationPlan';
import { buildConnectorAuditTrail } from '../services/connectorActivation/buildConnectorAuditTrail';
import { connectorStatus } from '../connectors/connectorStatus';
import { SOURCE_LEGAL_REQUIREMENTS } from '../config/connectors/sourceLegalRequirements';
import { storeConnectorCredentialProfile } from '../services/connectorActivation/storeConnectorCredentialProfile';
import { getConnectorActivationState } from '../services/connectorActivation/getConnectorActivationState';
import { executeConnectorTestRun } from '../services/connectorActivation/executeConnectorTestRun';
import { activateConnectorIfEligible } from '../services/connectorActivation/activateConnectorIfEligible';
import { deactivateConnector } from '../services/connectorActivation/deactivateConnector';
import { buildConnectorActivationAudit } from '../services/connectorActivation/buildConnectorActivationAudit';
import ConnectorSourceApproval from '../models/ConnectorSourceApproval';
import { logAuditEvent } from '../utils/auditLog';
import { getTucbsLayerCatalog, getTucbsLayerHealth, patchLayerVisibility, syncTucbsLayerCatalog } from '../connectors/tucbs/tucbsLayerCatalog';
import {
  CONNECTOR_SOURCE_REGISTRY,
  findConnectorSourceRegistry,
} from '../config/connectors/sourceRegistryCatalog';
import {
  buildAdminConnectorCenter,
  runConnectorSyncNow,
  runScheduledMetadataSync,
} from '../services/connectorActivation/connectorSyncEngine';

export const getAdminConnectors = async (_req: AuthRequest, res: Response) => {
  const readiness = buildConnectorReadiness();
  const legalRegistry = buildLegalSourceRegistry();

  return res.json({
    generatedAt: new Date().toISOString(),
    connectors: readiness.connectors,
    summary: readiness.summary,
    legalRegistry,
  });
};

export const getAdminSourceRegistry = async (_req: AuthRequest, res: Response) => {
  return res.json({
    generatedAt: new Date().toISOString(),
    sources: CONNECTOR_SOURCE_REGISTRY,
  });
};

export const getAdminConnectorCatalog = async (_req: AuthRequest, res: Response) => {
  const entries = CONNECTOR_SOURCE_REGISTRY.map((source) => ({
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

export const getAdminConnectorCenter = async (_req: AuthRequest, res: Response) => {
  const center = await buildAdminConnectorCenter();
  return res.json(center);
};

export const postAdminConnectorSyncNow = async (req: AuthRequest, res: Response) => {
  const connector = findConnectorByKey(req.params.connectorKey);
  const sourceRegistry = findConnectorSourceRegistry(req.params.connectorKey);
  if (!connector && !sourceRegistry) return res.status(404).json({ error: 'Connector not found' });

  const run = await runConnectorSyncNow(req.params.connectorKey, req.user?._id?.toString(), 'MANUAL');

  await logAuditEvent({
    type: 'connector_sync_run',
    actorUserId: req.user!._id.toString(),
    actorRole: req.user!.role,
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

export const postAdminConnectorScheduledSync = async (req: AuthRequest, res: Response) => {
  const result = await runScheduledMetadataSync(req.user?._id?.toString());

  await logAuditEvent({
    type: 'connector_scheduled_sync_run',
    actorUserId: req.user!._id.toString(),
    actorRole: req.user!.role,
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

export const getAdminConnectorByKey = async (req: AuthRequest, res: Response) => {
  const connector = findConnectorByKey(req.params.connectorKey);
  if (!connector) return res.status(404).json({ error: 'Connector not found' });

  const status = connectorStatus(connector);
  const credentials = validateConnectorCredentials(connector);
  const activationPlan = buildConnectorActivationPlan(connector);

  return res.json({
    connector: {
      ...connector,
      legalRequirement: SOURCE_LEGAL_REQUIREMENTS[connector.legalRequirementKey],
    },
    status,
    credentials,
    activationPlan,
  });
};

export const postAdminConnectorTest = async (req: AuthRequest, res: Response) => {
  const connector = findConnectorByKey(req.params.connectorKey);
  if (!connector) return res.status(404).json({ error: 'Connector not found' });

  const healthCheck = await runConnectorHealthCheck(connector);
  return res.json(healthCheck);
};

export const getAdminConnectorActivationPlan = async (req: AuthRequest, res: Response) => {
  const connector = findConnectorByKey(req.params.connectorKey);
  if (!connector) return res.status(404).json({ error: 'Connector not found' });

  const plan = buildConnectorActivationPlan(connector);
  return res.json(plan);
};

export const getAdminConnectorAuditTrail = async (_req: AuthRequest, res: Response) => {
  const audits = await buildConnectorAuditTrail();

  return res.json({
    connectorsTracked: CONNECTOR_REGISTRY.map((c) => c.key),
    ...audits,
  });
};

// V19: POST /admin/connectors/:connectorKey/credentials
// Stores credential presence mask — never raw secrets.
// Body: { presentKeys: string[] } — list of env var names that ARE present
export const postAdminConnectorCredentials = async (req: AuthRequest, res: Response) => {
  const { connectorKey } = req.params;
  const connector = findConnectorByKey(connectorKey);
  const execution = findConnectorExecution(connectorKey);
  if (!connector || !execution) return res.status(404).json({ error: 'Connector not found' });

  const presentKeys: unknown = req.body?.presentKeys;
  if (!Array.isArray(presentKeys) || presentKeys.some((k) => typeof k !== 'string')) {
    return res.status(400).json({ error: 'presentKeys must be an array of strings' });
  }

  const result = await storeConnectorCredentialProfile({
    connectorKey,
    presentKeys: presentKeys as string[],
    allRequiredKeys: execution.requiredEnv,
    userId: req.user!._id.toString(),
    ip: req.ip,
  });

  return res.json(result);
};

// V19: GET /admin/connectors/:connectorKey — enhanced with activation state
export const getAdminConnectorActivationState = async (req: AuthRequest, res: Response) => {
  const connector = findConnectorByKey(req.params.connectorKey);
  if (!connector) return res.status(404).json({ error: 'Connector not found' });

  const [activationState, credentials, activationPlan] = await Promise.all([
    getConnectorActivationState(req.params.connectorKey),
    validateConnectorCredentials(connector),
    buildConnectorActivationPlan(connector),
  ]);

  return res.json({
    connector: {
      ...connector,
      legalRequirement: SOURCE_LEGAL_REQUIREMENTS[connector.legalRequirementKey],
    },
    status: connectorStatus(connector),
    activationState,
    credentials,
    activationPlan,
  });
};

// V19: POST /admin/connectors/:connectorKey/test
export const postAdminConnectorTestV19 = async (req: AuthRequest, res: Response) => {
  const connector = findConnectorByKey(req.params.connectorKey);
  if (!connector) return res.status(404).json({ error: 'Connector not found' });

  const result = await executeConnectorTestRun({
    connectorKey: req.params.connectorKey,
    userId: req.user!._id.toString(),
    ip: req.ip,
  });

  return res.json(result);
};

// V19: POST /admin/connectors/:connectorKey/activate
export const postAdminConnectorActivate = async (req: AuthRequest, res: Response) => {
  const connector = findConnectorByKey(req.params.connectorKey);
  if (!connector) return res.status(404).json({ error: 'Connector not found' });

  const result = await activateConnectorIfEligible({
    connectorKey: req.params.connectorKey,
    userId: req.user!._id.toString(),
    ip: req.ip,
  });

  if (!result.activated) {
    return res.status(422).json({ error: result.reason });
  }

  return res.json(result);
};

// V19: POST /admin/connectors/:connectorKey/deactivate
export const postAdminConnectorDeactivate = async (req: AuthRequest, res: Response) => {
  const connector = findConnectorByKey(req.params.connectorKey);
  if (!connector) return res.status(404).json({ error: 'Connector not found' });

  const result = await deactivateConnector({
    connectorKey: req.params.connectorKey,
    userId: req.user!._id.toString(),
    ip: req.ip,
  });

  if (!result.deactivated) {
    return res.status(422).json({ error: result.reason });
  }

  return res.json(result);
};

// V19: GET /admin/connectors/:connectorKey/audit
export const getAdminConnectorAuditByKey = async (req: AuthRequest, res: Response) => {
  const connector = findConnectorByKey(req.params.connectorKey);
  if (!connector) return res.status(404).json({ error: 'Connector not found' });

  const audit = await buildConnectorActivationAudit(req.params.connectorKey);
  return res.json(audit);
};

// V19: PATCH /admin/connectors/:connectorKey/source-approval
// Body: { approved: boolean, note?: string }
export const patchAdminConnectorSourceApproval = async (req: AuthRequest, res: Response) => {
  const connector = findConnectorByKey(req.params.connectorKey);
  if (!connector) return res.status(404).json({ error: 'Connector not found' });

  const { approved, note } = req.body ?? {};
  if (typeof approved !== 'boolean') {
    return res.status(400).json({ error: 'approved must be a boolean' });
  }

  const record = await ConnectorSourceApproval.findOneAndUpdate(
    { connectorKey: req.params.connectorKey },
    {
      connectorKey: req.params.connectorKey,
      approved,
      approvedByUserId: req.user!._id.toString(),
      approvedAt: approved ? new Date() : undefined,
      note: typeof note === 'string' ? note : undefined,
    },
    { upsert: true, new: true },
  );

  await logAuditEvent({
    type: 'connector_source_approval_updated',
    actorUserId: req.user!._id.toString(),
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

// P3: GET /admin/connectors/tucbs
export const getAdminTucbsConnector = async (_req: AuthRequest, res: Response) => {
  const connector = findConnectorByKey('tucbs_ogc');
  if (!connector) return res.status(404).json({ error: 'TUCBS connector not registered' });

  const [activationState, catalog] = await Promise.all([
    getConnectorActivationState('tucbs_ogc'),
    getTucbsLayerCatalog(),
  ]);

  return res.json({
    provider: 'tucbs_public_geo_layers',
    mode: 'READ_ONLY_GEO_LAYERS',
    connector: {
      ...connector,
      legalRequirement: SOURCE_LEGAL_REQUIREMENTS[connector.legalRequirementKey],
    },
    activationState,
    diagnostics: catalog.diagnostics,
  });
};

// P3: GET /admin/connectors/ogc
export const getAdminOgcConnectors = async (_req: AuthRequest, res: Response) => {
  const catalog = await getTucbsLayerCatalog();
  return res.json({
    provider: 'tucbs_public_geo_layers',
    mode: 'READ_ONLY_GEO_LAYERS',
    services: catalog.diagnostics?.services || [],
  });
};

// P3: POST /admin/connectors/tucbs/sync
export const postAdminTucbsSync = async (req: AuthRequest, res: Response) => {
  const result = await syncTucbsLayerCatalog();
  await logAuditEvent({
    type: 'connector_tucbs_sync',
    actorUserId: req.user!._id.toString(),
    actorRole: req.user!.role,
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

// P3: GET /admin/layers
export const getAdminLayers = async (_req: AuthRequest, res: Response) => {
  const catalog = await getTucbsLayerCatalog();
  return res.json({
    provider: catalog.provider,
    mode: 'READ_ONLY_GEO_LAYERS',
    layers: catalog.layers,
  });
};

// P3: PATCH /admin/layers/:layerId/visibility
export const patchAdminLayerVisibility = async (req: AuthRequest, res: Response) => {
  const { layerId } = req.params;
  const visible = req.body?.visible;
  const opacity = req.body?.opacity;

  const updated = await patchLayerVisibility(layerId, {
    visible: typeof visible === 'boolean' ? visible : undefined,
    opacity: typeof opacity === 'number' ? opacity : undefined,
  });

  await logAuditEvent({
    type: 'layer_visibility_updated',
    actorUserId: req.user!._id.toString(),
    actorRole: req.user!.role,
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

// P3: GET /admin/layer-health
export const getAdminLayerHealth = async (_req: AuthRequest, res: Response) => {
  const health = await getTucbsLayerHealth();
  return res.json({
    mode: 'READ_ONLY_GEO_LAYERS',
    ...health,
  });
};

// P3.3: GET /admin/geo-diagnostics
export const getAdminGeoDiagnostics = async (_req: AuthRequest, res: Response) => {
  const health = await getTucbsLayerHealth();
  return res.json({
    mode: 'READ_ONLY_GEO_LAYERS',
    diagnosticsScope: 'ADMIN',
    generatedAt: new Date().toISOString(),
    ...health,
  });
};

// P3.3: GET /geo/layers
export const getGeoLayers = async (_req: AuthRequest, res: Response) => {
  const catalog = await getTucbsLayerCatalog();
  return res.json({
    provider: catalog.provider,
    mode: 'READ_ONLY_GEO_LAYERS',
    layers: catalog.layers,
  });
};

// P3.3: GET /geo/diagnostics
export const getGeoDiagnostics = async (_req: AuthRequest, res: Response) => {
  const health = await getTucbsLayerHealth();
  return res.json({
    mode: 'READ_ONLY_GEO_LAYERS',
    diagnosticsScope: 'USER',
    generatedAt: new Date().toISOString(),
    ...health,
  });
};
