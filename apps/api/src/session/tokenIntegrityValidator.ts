import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';

export function tokenIntegrityValidator(token?: string) {
  if (!token) {
    return { valid: false, reason: 'missing_token' };
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id?: string; exp?: number };
    return {
      valid: Boolean(decoded?.id),
      userId: decoded?.id || null,
      expiresAt: decoded?.exp ? decoded.exp * 1000 : null,
      reason: decoded?.id ? 'valid' : 'missing_subject',
    };
  } catch {
    return { valid: false, reason: 'invalid_signature' };
  }
}
