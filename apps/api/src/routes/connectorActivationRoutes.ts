import express from 'express';
import { auth } from '../middleware/auth';
import { admin } from '../middleware/admin';
import {
  getAdminConnectorActivationPlan,
  getAdminConnectorAuditTrail,
  getAdminConnectorByKey,
  getAdminConnectors,
  postAdminConnectorTest,
} from '../controllers/connectorActivationController';

const router = express.Router();

router.get('/admin/connectors', auth, admin, getAdminConnectors);
router.get('/admin/connectors/audit-trail', auth, admin, getAdminConnectorAuditTrail);
router.get('/admin/connectors/:connectorKey', auth, admin, getAdminConnectorByKey);
router.post('/admin/connectors/:connectorKey/test', auth, admin, postAdminConnectorTest);
router.get('/admin/connectors/:connectorKey/activation-plan', auth, admin, getAdminConnectorActivationPlan);

export default router;
