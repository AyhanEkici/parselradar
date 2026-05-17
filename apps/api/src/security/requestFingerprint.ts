import crypto from 'crypto';
import { SECURITY_POLICIES } from '../config/runtime/securityPolicies';

export function requestFingerprint(input: {
  ip?: string;
  userAgent?: string;
  method?: string;
  path?: string;
  userId?: string;
}) {
  const raw = [
    SECURITY_POLICIES.fingerprintSalt,
    input.ip || 'ip:unknown',
    input.userAgent || 'ua:unknown',
    input.method || 'method:unknown',
    input.path || 'path:unknown',
    input.userId || 'user:anon',
  ].join('|');

  return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 24);
}
