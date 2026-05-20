import crypto from 'crypto';
import PasswordResetToken, { IPasswordResetToken } from '../../models/PasswordResetToken';

export const PASSWORD_RESET_TTL_MINUTES = 30;

export function normalizeResetToken(rawToken: string) {
  return String(rawToken || '').trim();
}

export function hashPasswordResetToken(rawToken: string) {
  return crypto.createHash('sha256').update(normalizeResetToken(rawToken)).digest('hex');
}

export function generatePasswordResetToken() {
  const rawToken = crypto.randomBytes(32).toString('base64url');
  const tokenHash = hashPasswordResetToken(rawToken);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000);
  return { rawToken, tokenHash, expiresAt };
}

export async function invalidateUnusedPasswordResetTokens(userId: string) {
  const now = new Date();
  await PasswordResetToken.updateMany(
    { userId, usedAt: null, revokedAt: null },
    { $set: { revokedAt: now, updatedAt: now } }
  );
}

export async function createPasswordResetToken(userId: string) {
  await invalidateUnusedPasswordResetTokens(userId);
  const tokenData = generatePasswordResetToken();
  const record = await PasswordResetToken.create({
    userId,
    tokenHash: tokenData.tokenHash,
    expiresAt: tokenData.expiresAt,
    usedAt: null,
    revokedAt: null,
  });
  return { record, rawToken: tokenData.rawToken };
}

export async function findUsablePasswordResetToken(rawToken: string) {
  const tokenHash = hashPasswordResetToken(rawToken);
  const now = new Date();
  return PasswordResetToken.findOne({
    tokenHash,
    usedAt: null,
    revokedAt: null,
    expiresAt: { $gt: now },
  }) as Promise<IPasswordResetToken | null>;
}

export async function markPasswordResetTokenUsed(tokenId: string) {
  const now = new Date();
  await PasswordResetToken.updateOne({ _id: tokenId }, { $set: { usedAt: now, updatedAt: now } });
}
