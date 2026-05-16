import AuditEvent from '../models/AuditEvent';

const SENSITIVE_KEYS = [
  'password', 'token', 'jwt', 'secret', 'stripeSecret', 'accessToken', 'refreshToken', 'cookie', 'session', 'authorization', 'apiKey', 'stripeKey', 'stripeToken', 'card', 'cvv', 'exp', 'number', 'cvc', 'ssn', 'privateKey', 'publicKey', 'clientSecret', 'clientToken', 'idToken', 'raw', 'payload', 'signature', 'sig', 'webhookSecret', 'webhookSignature', 'stripeSignature', 'stripeWebhookSecret', 'stripeWebhookSignature'
];

function sanitize(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitize);
  const clean: Record<string, any> = {};
  for (const k of Object.keys(obj)) {
    if (SENSITIVE_KEYS.some(s => k.toLowerCase().includes(s))) continue;
    const v = obj[k];
    if (typeof v === 'object') clean[k] = sanitize(v);
    else clean[k] = v;
  }
  return clean;
}

export async function logAuditEvent(event: {
  type: string;
  actorUserId?: string;
  actorRole?: string;
  targetType?: string;
  targetId?: string;
  message: string;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  success?: boolean;
}) {
  try {
    await AuditEvent.create({
      ...event,
      metadata: sanitize(event.metadata),
      createdAt: new Date(),
    });
  } catch (err) {
    // Never crash business flow
    // Optionally log to console in dev
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Audit log failure:', err);
    }
  }
}
