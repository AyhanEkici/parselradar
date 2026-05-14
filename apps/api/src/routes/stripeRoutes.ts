import express from 'express';
import { createCheckoutSession, stripeWebhook } from '../controllers/stripeController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.post('/create-checkout-session', auth, createCheckoutSession);
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

export default router;
