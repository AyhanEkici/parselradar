"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhook = exports.createCheckoutSession = void 0;
const auditLog_1 = require("../utils/auditLog");
const stripeService_1 = require("../services/stripeService");
const StripeCheckoutSession_1 = __importDefault(require("../models/StripeCheckoutSession"));
const CreditLedger_1 = __importDefault(require("../models/CreditLedger"));
const env_1 = require("../config/env");
const authUser_1 = require("../utils/authUser");
const createCheckoutSession = async (req, res) => {
    const user = (0, authUser_1.requireAuthUser)(req);
    const { creditAmount } = req.body;
    const allowedPackages = [25, 50];
    if (!creditAmount || !allowedPackages.includes(creditAmount)) {
        await (0, auditLog_1.logAuditEvent)({
            type: 'stripe_checkout_create',
            actorUserId: user._id.toString(),
            actorRole: user.role,
            targetType: 'User',
            targetId: user._id.toString(),
            message: 'Checkout failed: invalid package',
            metadata: { creditAmount },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            success: false,
        });
        return res.status(400).json({ error: 'Geçersiz veya desteklenmeyen kredi paketi' });
    }
    // Map creditAmount to price ID
    const priceId = creditAmount === 25 ? process.env.STRIPE_PRICE_25_CREDITS : process.env.STRIPE_PRICE_50_CREDITS;
    if (!priceId || !priceId.startsWith('price_')) {
        await (0, auditLog_1.logAuditEvent)({
            type: 'stripe_checkout_create',
            actorUserId: user._id.toString(),
            actorRole: user.role,
            targetType: 'User',
            targetId: user._id.toString(),
            message: 'Checkout failed: Stripe price ID not configured',
            metadata: { creditAmount, priceId },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            success: false,
        });
        return res.status(500).json({ error: 'Stripe price ID not configured for requested credit amount' });
    }
    try {
        const session = await stripeService_1.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'payment',
            success_url: process.env.CLIENT_URL + '/credits?success=1',
            cancel_url: process.env.CLIENT_URL + '/credits?canceled=1',
            metadata: { userId: user._id.toString(), creditAmount: creditAmount.toString() },
        });
        await StripeCheckoutSession_1.default.create({ userId: user._id, sessionId: session.id, creditAmount, status: 'PENDING' });
        await (0, auditLog_1.logAuditEvent)({
            type: 'stripe_checkout_create',
            actorUserId: user._id.toString(),
            actorRole: user.role,
            targetType: 'User',
            targetId: user._id.toString(),
            message: 'Checkout session created',
            metadata: { creditAmount, sessionId: session.id },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            success: true,
        });
        res.json({ url: session.url });
    }
    catch (err) {
        await (0, auditLog_1.logAuditEvent)({
            type: 'stripe_checkout_create',
            actorUserId: user._id.toString(),
            actorRole: user.role,
            targetType: 'User',
            targetId: user._id.toString(),
            message: 'Checkout failed: Stripe error',
            metadata: { creditAmount, error: err.message },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            success: false,
        });
        res.status(400).json({ error: err.message || 'Stripe oturumu oluşturulamadı' });
    }
};
exports.createCheckoutSession = createCheckoutSession;
// Stripe webhook handler (raw body required)
const stripeWebhook = async (req, res) => {
    let event;
    try {
        const sig = req.headers['stripe-signature'];
        const rawBody = req.rawBody || req.body;
        event = stripeService_1.stripe.webhooks.constructEvent(rawBody, sig, env_1.STRIPE_WEBHOOK_SECRET);
    }
    catch (err) {
        await (0, auditLog_1.logAuditEvent)({
            type: 'stripe_webhook',
            actorUserId: undefined,
            actorRole: undefined,
            targetType: 'Stripe',
            targetId: undefined,
            message: 'Webhook signature verification failed',
            metadata: { error: err.message },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            success: false,
        });
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.metadata.userId;
        const creditAmount = parseInt(session.metadata.creditAmount, 10);
        const sessionId = session.id;
        // Idempotency: only fulfill if not already done
        const checkoutSession = await StripeCheckoutSession_1.default.findOne({ sessionId });
        if (checkoutSession && checkoutSession.status !== 'PAID') {
            await CreditLedger_1.default.create({ userId, type: 'STRIPE', amount: creditAmount, reason: 'Stripe kredi yükleme' });
            checkoutSession.status = 'PAID';
            checkoutSession.fulfilledAt = new Date();
            checkoutSession.amountTotal = session.amount_total ? session.amount_total / 100 : undefined;
            checkoutSession.currency = session.currency?.toUpperCase();
            await checkoutSession.save();
            await (0, auditLog_1.logAuditEvent)({
                type: 'stripe_webhook',
                actorUserId: userId,
                actorRole: undefined,
                targetType: 'StripeCheckoutSession',
                targetId: sessionId,
                message: 'Stripe credits fulfilled',
                metadata: { creditAmount },
                ip: req.ip,
                userAgent: req.get('user-agent'),
                success: true,
            });
            await (0, auditLog_1.logAuditEvent)({
                type: 'credits_granted',
                actorUserId: userId,
                actorRole: undefined,
                targetType: 'User',
                targetId: userId,
                message: 'Credits granted via Stripe',
                metadata: { creditAmount, sessionId },
                ip: req.ip,
                userAgent: req.get('user-agent'),
                success: true,
            });
        }
    }
    res.json({ received: true });
};
exports.stripeWebhook = stripeWebhook;
