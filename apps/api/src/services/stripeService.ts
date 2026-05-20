import Stripe from 'stripe';
import { ENV } from '../config/env';

let cachedStripe: Stripe | null = null;

export function getStripeRuntimeState() {
	const key = ENV.NODE_ENV === 'production'
		? ENV.STRIPE_SECRET_KEY || ENV.STRIPE_LIVE_SECRET_KEY
		: ENV.STRIPE_SECRET_KEY || ENV.STRIPE_TEST_SECRET_KEY;

	if (!key) {
		return { configured: false, reason: 'Stripe is not configured.', mode: 'degraded' as const };
	}

	return { configured: true, reason: 'Stripe is configured.', mode: 'ready' as const };
}

export function getStripeClient() {
	if (cachedStripe) return cachedStripe;
	const state = getStripeRuntimeState();
	if (!state.configured) return null;
	const key = ENV.NODE_ENV === 'production'
		? ENV.STRIPE_SECRET_KEY || ENV.STRIPE_LIVE_SECRET_KEY
		: ENV.STRIPE_SECRET_KEY || ENV.STRIPE_TEST_SECRET_KEY;
	if (!key) return null;
	cachedStripe = new Stripe(key, { apiVersion: '2023-10-16' });
	return cachedStripe;
}
