import { validateAuthToken } from './canonicalAuthValidator';

export async function tokenIntegrityValidator(token?: string) {
  if (!token) {
    return { valid: false, reason: 'missing_token' };
  }

  const result = await validateAuthToken(token);
  return {
    valid: result.ok,
    userId: result.user?._id || null,
    expiresAt: null,
    reason: result.code === 'TOKEN_PAYLOAD_MISSING_SUBJECT' ? 'missing_subject' : result.ok ? 'valid' : 'invalid_signature',
  };
}
