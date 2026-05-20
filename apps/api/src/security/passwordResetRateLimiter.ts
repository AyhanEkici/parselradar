import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { logAuditEvent } from '../utils/auditLog';

async function passwordResetRateLimitHandler(req: Request, res: Response) {
  await logAuditEvent({
    type: 'rate_limit',
    actorUserId: (req as any).user?._id?.toString(),
    actorRole: (req as any).user?.role,
    targetType: 'IP',
    targetId: req.ip,
    message: 'Password reset rate limit hit',
    metadata: { path: req.path, method: req.method },
    ip: req.ip,
    userAgent: req.get('user-agent'),
    success: false,
  });
  res.status(429).json({ error: 'Too many requests', code: 'RATE_LIMITED' });
}

export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  handler: passwordResetRateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});

export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  handler: passwordResetRateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});
