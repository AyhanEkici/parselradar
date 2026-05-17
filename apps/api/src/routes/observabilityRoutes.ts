import express from 'express';
import { auth } from '../middleware/auth';
import { admin } from '../middleware/admin';
import {
  getAdminAnalytics,
  getAdminObservability,
  getAdminTelemetry,
} from '../controllers/observabilityController';

const router = express.Router();

router.get('/admin/observability', auth, admin, getAdminObservability);
router.get('/admin/analytics', auth, admin, getAdminAnalytics);
router.get('/admin/telemetry', auth, admin, getAdminTelemetry);

export default router;
