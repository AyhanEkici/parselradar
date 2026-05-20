import crypto from 'crypto';

export function sessionDeviceFingerprint(input: { userAgent?: string; ip?: string; acceptLanguage?: string }) {
  const raw = `${input.userAgent || 'ua'}|${input.ip || 'ip'}|${input.acceptLanguage || 'lang'}`;
  return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 24);
}
