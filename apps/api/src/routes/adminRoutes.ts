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
	getAdminAnalyses,
	getAdminCreditLedger,
	getAdminStripeSessions,
	getAdminRuntimeOverview
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
router.get('/analyses', auth, admin, getAdminAnalyses);
router.get('/credit-ledger', auth, admin, getAdminCreditLedger);
router.get('/stripe-sessions', auth, admin, getAdminStripeSessions);
router.get('/runtime', auth, admin, getAdminRuntimeOverview);

export default router;
