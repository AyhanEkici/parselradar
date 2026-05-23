import crypto from 'crypto';
import express, { NextFunction, Request, Response } from 'express';
import { auth } from '../middleware/auth';
import { admin } from '../middleware/admin';
import { CONNECTOR_SYNC_CRON_SECRET } from '../config/env';
import {
  getAdminConnectorActivationPlan,
  getAdminConnectorAuditTrail,
  getAdminConnectorByKey,
  getAdminConnectors,
  postAdminConnectorTest,
  postAdminConnectorCredentials,
  getAdminConnectorActivationState,
  postAdminConnectorTestV19,
  postAdminConnectorActivate,
  postAdminConnectorDeactivate,
  getAdminConnectorAuditByKey,
  patchAdminConnectorSourceApproval,
  getAdminTucbsConnector,
  getAdminOgcConnectors,
  postAdminTucbsSync,
  getAdminLayers,
  patchAdminLayerVisibility,
  getAdminLayerHealth,
  getAdminGeoDiagnostics,
  getGeoLayers,
  getGeoDiagnostics,
  getAdminConnectorCenter,
  getAdminConnectorCatalog,
  getAdminSourceRegistry,
  postAdminConnectorSyncNow,
  postAdminConnectorScheduledSync,
} from '../controllers/connectorActivationController';

const router = express.Router();

function safeSecretMatch(provided?: string, expected?: string) {
  const left = Buffer.from(String(provided || ''), 'utf8');
  const right = Buffer.from(String(expected || ''), 'utf8');
  if (left.length === 0 || right.length === 0 || left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function hasValidScheduledSyncSecret(req: Request) {
  const configuredSecret = String(CONNECTOR_SYNC_CRON_SECRET || '').trim();
  if (!configuredSecret) return false;
  const headerSecret = String(req.header('x-connector-sync-secret') || '').trim();
  return safeSecretMatch(headerSecret, configuredSecret);
}

function scheduledSyncTriggerGuard(req: Request, res: Response, next: NextFunction) {
  // Allow scheduler-triggered calls only when secret header matches configured secret.
  if (hasValidScheduledSyncSecret(req)) {
    return next();
  }

  // Preserve manual/admin trigger path with existing auth+admin model.
  return auth(req as any, res, () => {
    return admin(req as any, res, next);
  });
}

// V17 routes
router.get('/admin/connectors', auth, admin, getAdminConnectors);
router.get('/admin/connectors/source-registry', auth, admin, getAdminSourceRegistry);
router.get('/admin/connectors/catalog', auth, admin, getAdminConnectorCatalog);
router.get('/admin/connectors/center', auth, admin, getAdminConnectorCenter);
router.post('/admin/connectors/sync/scheduled', scheduledSyncTriggerGuard, postAdminConnectorScheduledSync);
router.get('/admin/connectors/audit-trail', auth, admin, getAdminConnectorAuditTrail);
router.get('/admin/connectors/tucbs', auth, admin, getAdminTucbsConnector);
router.post('/admin/connectors/tucbs/sync', auth, admin, postAdminTucbsSync);
router.get('/admin/connectors/ogc', auth, admin, getAdminOgcConnectors);
router.get('/admin/connectors/:connectorKey/activation-plan', auth, admin, getAdminConnectorActivationPlan);
router.post('/admin/connectors/:connectorKey/sync-now', auth, admin, postAdminConnectorSyncNow);

// V19 extended detail route (replaces V17 GET /:connectorKey with activation state)
router.get('/admin/connectors/:connectorKey', auth, admin, getAdminConnectorActivationState);

// V19 new routes
router.post('/admin/connectors/:connectorKey/credentials', auth, admin, postAdminConnectorCredentials);
router.post('/admin/connectors/:connectorKey/test', auth, admin, postAdminConnectorTestV19);
router.post('/admin/connectors/:connectorKey/activate', auth, admin, postAdminConnectorActivate);
router.post('/admin/connectors/:connectorKey/deactivate', auth, admin, postAdminConnectorDeactivate);
router.get('/admin/connectors/:connectorKey/audit', auth, admin, getAdminConnectorAuditByKey);
router.patch('/admin/connectors/:connectorKey/source-approval', auth, admin, patchAdminConnectorSourceApproval);

// P3 external intelligence surfaces
router.get('/admin/layers', auth, admin, getAdminLayers);
router.patch('/admin/layers/:layerId/visibility', auth, admin, patchAdminLayerVisibility);
router.get('/admin/layer-health', auth, admin, getAdminLayerHealth);
router.get('/admin/geo-diagnostics', auth, admin, getAdminGeoDiagnostics);

// P3.3 authenticated geo read surfaces
router.get('/geo/layers', auth, getGeoLayers);
router.get('/geo/diagnostics', auth, getGeoDiagnostics);

export default router;
