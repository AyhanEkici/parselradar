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
    console.error('[sessionIntegrityValidator] NO TOKEN PROVIDED');
    return { valid: false, sessionTrust: 'UNKNOWN', reason: 'MISSING_TOKEN' };
  }

  try {
    console.log('[sessionIntegrityValidator] ATTEMPTING VERIFICATION', {
      tokenLength: token.length,
      tokenStart: token.substring(0, 20),
      jwtSecretLength: JWT_SECRET?.length,
      jwtSecretStart: JWT_SECRET?.substring(0, 5),
    });
    const decoded = jwt.verify(token, JWT_SECRET) as { id?: string; userId?: string; sub?: string; exp?: number; iat?: number };
    console.log('[sessionIntegrityValidator] VERIFICATION SUCCESS');
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
        tokenLength: token?.length || 0,
        jwtSecretLength: JWT_SECRET?.length || 0,
        errorMessage: (error as any)?.message,
      });
    }
      (global as any).lastJwtDebug = {
        timestamp: new Date().toISOString(),
        type: 'verification_error',
        tokenLength: token?.length || 0,
        jwtSecretLength: JWT_SECRET?.length || 0,
        jwtSecretStart: JWT_SECRET?.substring(0, 5),
        errorMessage: (error as any)?.message,
      };
    return { valid: false, sessionTrust: 'BLOCKED', reason: 'INVALID_SIGNATURE' };
  }
}
