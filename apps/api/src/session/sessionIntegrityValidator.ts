import { validateAuthToken } from './canonicalAuthValidator';

export type SessionTrust = 'UNKNOWN' | 'VERIFIED' | 'SUSPICIOUS' | 'BLOCKED';

export type SessionIntegrityResult = {
  valid: boolean;
  sessionTrust: SessionTrust;
  reason: string;
  userId?: string;
  expiresAt?: number;
  issuedAt?: number;
  issuedAtSeconds?: number;
};

export async function sessionIntegrityValidator(token?: string | null): Promise<SessionIntegrityResult> {
  if (!token) {
    return { valid: false, sessionTrust: 'UNKNOWN', reason: 'MISSING_TOKEN' };
  }

  const result = await validateAuthToken(token);
  return {
    valid: result.ok,
    sessionTrust: result.ok ? 'VERIFIED' : result.code === 'INVALID_SIGNATURE' ? 'BLOCKED' : 'SUSPICIOUS',
    reason: result.code,
    userId: result.user?._id,
    expiresAt: undefined,
    issuedAt: result.diagnostics.tokenIatMs,
    issuedAtSeconds: result.diagnostics.tokenIatSeconds,
  };
}
