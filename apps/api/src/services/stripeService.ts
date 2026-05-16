import Stripe from 'stripe';
import { ENV } from '../config/env';

const key = ENV.NODE_ENV === 'production'
	? ENV.STRIPE_SECRET_KEY || ENV.STRIPE_LIVE_SECRET_KEY
	: ENV.STRIPE_SECRET_KEY || ENV.STRIPE_TEST_SECRET_KEY;

export const stripe = new Stripe(key, { apiVersion: '2023-10-16' });
