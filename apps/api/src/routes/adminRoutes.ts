import express from 'express';
import { admin } from '../middleware/admin';
import { auth } from '../middleware/auth';
import {
	getAllProperties,
	getPropertyById,
	reviewProperty,
	acceptDealPool,
	shareDealPool,
	getAdminUsers,
	getAdminAnalyses,
	getAdminCreditLedger,
	getAdminStripeSessions
} from '../controllers/adminController';

const router = express.Router();

router.get('/properties', auth, admin, getAllProperties);
router.get('/properties/:id', auth, admin, getPropertyById);
router.patch('/properties/:id/review', auth, admin, reviewProperty);
router.post('/deal-pool/:propertyId/accept', auth, admin, acceptDealPool);
router.post('/deal-pool/:entryId/share', auth, admin, shareDealPool);

// Admin operations suite
router.get('/users', auth, admin, getAdminUsers);
router.get('/analyses', auth, admin, getAdminAnalyses);
router.get('/credit-ledger', auth, admin, getAdminCreditLedger);
router.get('/stripe-sessions', auth, admin, getAdminStripeSessions);

export default router;
