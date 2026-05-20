import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';

export type SessionTrust = 'UNKNOWN' | 'VERIFIED' | 'SUSPICIOUS' | 'BLOCKED';

export type SessionIntegrityResult = {
  valid: boolean;
  sessionTrust: SessionTrust;
  reason: string;
  userId?: string;
  expiresAt?: number;
};

export function sessionIntegrityValidator(token?: string | null): SessionIntegrityResult {
  if (!token) {
    return { valid: false, sessionTrust: 'UNKNOWN', reason: 'missing_token' };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id?: string; exp?: number };
    if (!decoded?.id) {
      return { valid: false, sessionTrust: 'SUSPICIOUS', reason: 'missing_subject' };
    }

    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return {
        valid: false,
        sessionTrust: 'BLOCKED',
        reason: 'expired_token',
        userId: String(decoded.id),
        expiresAt: decoded.exp * 1000,
      };
    }

    return {
      valid: true,
      sessionTrust: 'VERIFIED',
      reason: 'token_verified',
      userId: String(decoded.id),
      expiresAt: decoded.exp ? decoded.exp * 1000 : undefined,
    };
  } catch (error) {
    if (process.env.AUTH_SAFE_DEBUG === 'true') {
      console.error('[sessionIntegrityValidator-error]', {
        tokenLength: token?.length || 0,
        jwtSecretLength: JWT_SECRET?.length || 0,
        errorMessage: (error as any)?.message,
      });
    }
    return { valid: false, sessionTrust: 'BLOCKED', reason: 'invalid_signature' };
  }
}
