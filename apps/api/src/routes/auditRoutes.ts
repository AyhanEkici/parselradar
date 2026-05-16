import express from 'express';
import { admin } from '../middleware/admin';
import { auth } from '../middleware/auth';
import { getAuditEvents } from '../controllers/auditController';

const router = express.Router();

// GET /admin/audit-events (admin only)
router.get('/admin/audit-events', auth, admin, getAuditEvents);

export default router;
