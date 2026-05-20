"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStripeRuntimeState = getStripeRuntimeState;
exports.getStripeClient = getStripeClient;
const stripe_1 = __importDefault(require("stripe"));
const env_1 = require("../config/env");
let cachedStripe = null;
function getStripeRuntimeState() {
    const key = env_1.ENV.NODE_ENV === 'production'
        ? env_1.ENV.STRIPE_SECRET_KEY || env_1.ENV.STRIPE_LIVE_SECRET_KEY
        : env_1.ENV.STRIPE_SECRET_KEY || env_1.ENV.STRIPE_TEST_SECRET_KEY;
    if (!key) {
        return { configured: false, reason: 'Stripe is not configured.', mode: 'degraded' };
    }
    return { configured: true, reason: 'Stripe is configured.', mode: 'ready' };
}
function getStripeClient() {
    if (cachedStripe)
        return cachedStripe;
    const state = getStripeRuntimeState();
    if (!state.configured)
        return null;
    const key = env_1.ENV.NODE_ENV === 'production'
        ? env_1.ENV.STRIPE_SECRET_KEY || env_1.ENV.STRIPE_LIVE_SECRET_KEY
        : env_1.ENV.STRIPE_SECRET_KEY || env_1.ENV.STRIPE_TEST_SECRET_KEY;
    if (!key)
        return null;
    cachedStripe = new stripe_1.default(key, { apiVersion: '2023-10-16' });
    return cachedStripe;
}
