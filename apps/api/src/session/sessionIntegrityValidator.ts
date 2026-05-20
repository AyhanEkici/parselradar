import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';

export type SessionTrust = 'UNKNOWN' | 'VERIFIED' | 'SUSPICIOUS' | 'BLOCKED';

export type SessionIntegrityResult = {
  valid: boolean;
  sessionTrust: SessionTrust;
  reason: string;
  userId?: string;
  expiresAt?: number;
  issuedAt?: number;
};

export function sessionIntegrityValidator(token?: string | null): SessionIntegrityResult {
  if (!token) {
    return { valid: false, sessionTrust: 'UNKNOWN', reason: 'MISSING_TOKEN' };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id?: string; userId?: string; sub?: string; exp?: number; iat?: number };
    const tokenUserId = decoded?.id || decoded?.userId || decoded?.sub;
    if (!tokenUserId) {
      return { valid: false, sessionTrust: 'SUSPICIOUS', reason: 'TOKEN_PAYLOAD_MISSING_SUBJECT' };
    }

    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return {
        valid: false,
        sessionTrust: 'BLOCKED',
        reason: 'EXPIRED_TOKEN',
        userId: String(tokenUserId),
        expiresAt: decoded.exp * 1000,
        issuedAt: typeof decoded.iat === 'number' ? decoded.iat * 1000 : undefined,
      };
    }

    return {
      valid: true,
      sessionTrust: 'VERIFIED',
      reason: 'TOKEN_VERIFIED',
      userId: String(tokenUserId),
      expiresAt: decoded.exp ? decoded.exp * 1000 : undefined,
      issuedAt: typeof decoded.iat === 'number' ? decoded.iat * 1000 : undefined,
    };
  } catch (error) {
    if (process.env.AUTH_SAFE_DEBUG === 'true') {
      console.error('[sessionIntegrityValidator-error]', {
        category: 'token_verification_failed',
        errorMessage: (error as any)?.message,
      });
    }
    return { valid: false, sessionTrust: 'BLOCKED', reason: 'INVALID_SIGNATURE' };
  }
}
