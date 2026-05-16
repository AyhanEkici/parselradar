import { Request, Response } from 'express';
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
    res.json({ url: session.url });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Stripe oturumu oluşturulamadı' });
  }
};

export const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent((req as unknown as { rawBody: Buffer }).rawBody, sig as string, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as { id: string; payment_intent: string };
    const dbSession = await StripeCheckoutSession.findOne({ sessionId: session.id });
    if (dbSession && dbSession.status === 'PENDING') {
      dbSession.status = 'PAID';
      await dbSession.save();
      await CreditLedger.create({ userId: dbSession.userId, type: 'STRIPE_PURCHASE', amount: dbSession.creditAmount, stripeCheckoutSessionId: dbSession.sessionId, stripePaymentIntentId: session.payment_intent });
    }
  }
  res.json({ received: true });
};
