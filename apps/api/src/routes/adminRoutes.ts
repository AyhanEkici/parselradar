import express from 'express';
import { admin } from '../middleware/admin';
import { auth } from '../middleware/auth';
import {
	getAllProperties,
	getPropertyById,
	reviewProperty,
	updatePropertyStatus,
	acceptDealPool,
	shareDealPool,
	getAdminUsers,
	updateAdminUserRole,
	getAdminAnalyses,
	getAdminCreditLedger,
	getAdminStripeSessions,
	getAdminDeploymentOverview,
	getAdminRuntimeOverview,
	getAdminRuntimeHealth,
	getAdminObservabilitySummary,
	getAdminSecurityOverview,
	getAdminEmailDeliveryState,
	getAdminMailDiagnostics,
	postAdminMailTestEmail,
	getAdminStripeDiagnostics,
} from '../controllers/adminController';

const router = express.Router();

router.get('/properties', auth, admin, getAllProperties);
router.get('/properties/:id', auth, admin, getPropertyById);
router.patch('/properties/:id/review', auth, admin, reviewProperty);
router.patch('/properties/:id/status', auth, admin, updatePropertyStatus);
router.post('/deal-pool/:propertyId/accept', auth, admin, acceptDealPool);
router.post('/deal-pool/:entryId/share', auth, admin, shareDealPool);

// Admin operations suite
router.get('/users', auth, admin, getAdminUsers);
router.patch('/users/:id/role', auth, admin, updateAdminUserRole);
router.get('/analyses', auth, admin, getAdminAnalyses);
router.get('/credit-ledger', auth, admin, getAdminCreditLedger);
router.get('/stripe-sessions', auth, admin, getAdminStripeSessions);
router.get('/deployment', auth, admin, getAdminDeploymentOverview);
router.get('/runtime', auth, admin, getAdminRuntimeOverview);
router.get('/runtime-health', auth, admin, getAdminRuntimeHealth);
router.get('/observability-summary', auth, admin, getAdminObservabilitySummary);
router.get('/security-overview', auth, admin, getAdminSecurityOverview);
router.get('/email-delivery-state', auth, admin, getAdminEmailDeliveryState);
router.get('/mail-diagnostics', auth, admin, getAdminMailDiagnostics);
router.post('/mail-diagnostics/test-email', auth, admin, postAdminMailTestEmail);
router.get('/stripe-diagnostics', auth, admin, getAdminStripeDiagnostics);

export default router;
