import express from 'express';
import { auth } from '../middleware/auth';
import { admin } from '../middleware/admin';
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
} from '../controllers/connectorActivationController';

const router = express.Router();

// V17 routes
router.get('/admin/connectors', auth, admin, getAdminConnectors);
router.get('/admin/connectors/audit-trail', auth, admin, getAdminConnectorAuditTrail);
router.get('/admin/connectors/:connectorKey/activation-plan', auth, admin, getAdminConnectorActivationPlan);

// V19 extended detail route (replaces V17 GET /:connectorKey with activation state)
router.get('/admin/connectors/:connectorKey', auth, admin, getAdminConnectorActivationState);

// V19 new routes
router.post('/admin/connectors/:connectorKey/credentials', auth, admin, postAdminConnectorCredentials);
router.post('/admin/connectors/:connectorKey/test', auth, admin, postAdminConnectorTestV19);
router.post('/admin/connectors/:connectorKey/activate', auth, admin, postAdminConnectorActivate);
router.post('/admin/connectors/:connectorKey/deactivate', auth, admin, postAdminConnectorDeactivate);
router.get('/admin/connectors/:connectorKey/audit', auth, admin, getAdminConnectorAuditByKey);
router.patch('/admin/connectors/:connectorKey/source-approval', auth, admin, patchAdminConnectorSourceApproval);

export default router;
