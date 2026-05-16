import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

function jsonRateLimitHandler(req: Request, res: Response) {
  res.status(429).json({ error: 'Too many requests', code: 'RATE_LIMITED' });
}

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  handler: jsonRateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});

export const analysisLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 3,
  handler: jsonRateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});

export const stripeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10,
  handler: jsonRateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  handler: jsonRateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});
