
import { Request, Response } from 'express';
import { logAuditEvent } from '../utils/auditLog';
import { stripe } from '../services/stripeService';
import StripeCheckoutSession from '../models/StripeCheckoutSession';
import CreditLedger from '../models/CreditLedger';
import { STRIPE_WEBHOOK_SECRET } from '../config/env';
import { AuthRequest } from '../middleware/auth';
import { requireAuthUser } from '../utils/authUser';

export const createCheckoutSession = async (req: AuthRequest, res: Response) => {
  const user = requireAuthUser(req);
  const { creditAmount } = req.body;
  const allowedPackages = [25, 50];
  if (!creditAmount || !allowedPackages.includes(creditAmount)) {
    await logAuditEvent({
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
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price_data: { currency: 'try', product_data: { name: 'Kredi' }, unit_amount: creditAmount * 100, }, quantity: 1 }],
      mode: 'payment',
      success_url: req.headers.origin + '/credits?success=1',
      cancel_url: req.headers.origin + '/credits?canceled=1',
      metadata: { userId: user._id.toString(), creditAmount: creditAmount.toString() },
    });
    await StripeCheckoutSession.create({ userId: user._id, sessionId: session.id, creditAmount, status: 'PENDING' });
    await logAuditEvent({
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
  } catch (err: any) {
    await logAuditEvent({
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

// Stripe webhook handler (raw body required)
export const stripeWebhook = async (req: Request, res: Response) => {
  let event;
  try {
    const sig = req.headers['stripe-signature'];
    const rawBody = (req as any).rawBody || req.body;
    event = stripe.webhooks.constructEvent(rawBody, sig as string, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    await logAuditEvent({
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
    const session = event.data.object as any;
    const userId = session.metadata.userId;
    const creditAmount = parseInt(session.metadata.creditAmount, 10);
    const sessionId = session.id;
    // Idempotency: only fulfill if not already done
    const checkoutSession = await StripeCheckoutSession.findOne({ sessionId });
    if (checkoutSession && checkoutSession.status !== 'PAID') {
      await CreditLedger.create({ userId, type: 'STRIPE', amount: creditAmount, reason: 'Stripe kredi yükleme' });
      checkoutSession.status = 'PAID';
      await checkoutSession.save();
      await logAuditEvent({
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
    }
  }
  res.json({ received: true });
};
