import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import { CLIENT_URL } from '../config/env';
import { auditPasswordResetEvent } from '../security/passwordResetAudit';
import {
  createPasswordResetToken,
  findUsablePasswordResetToken,
  markPasswordResetTokenUsed,
} from '../services/auth/passwordResetTokenService';
import { sendPasswordResetEmail, getPasswordResetEmailProviderState } from '../services/auth/passwordResetEmailService';

const GENERIC_FORGOT_SUCCESS = { message: 'Als dit e-mailadres bij ons bekend is, ontvang je een resetlink.' };
const GENERIC_RESET_SUCCESS = { message: 'Je wachtwoord is opnieuw ingesteld. Je kunt nu inloggen.' };
const GENERIC_RESET_FAILURE = { error: 'Wachtwoord opnieuw instellen mislukt.' };

function normalizeEmail(email: unknown) {
  return String(email || '').trim().toLowerCase();
}

function isStrongPassword(password: string) {
  const value = String(password || '');
  if (value.length < 12) return false;
  if (!/[a-z]/.test(value)) return false;
  if (!/[A-Z]/.test(value)) return false;
  if (!/\d/.test(value)) return false;
  if (!/[^A-Za-z0-9]/.test(value)) return false;
  return true;
}

function buildResetLink(rawToken: string) {
  const baseUrl = String(CLIENT_URL || 'https://parselradar.vercel.app').replace(/\/+$/, '');
  return `${baseUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;
}

export async function forgotPassword(req: Request, res: Response) {
  const email = normalizeEmail(req.body?.email);
  const providerState = getPasswordResetEmailProviderState();

  await auditPasswordResetEvent({
    action: 'forgot_password',
    outcome: 'allow',
    emailProviderState: providerState.state,
    ip: req.ip,
    userAgent: req.get('user-agent') || undefined,
    metadata: { emailProvided: Boolean(email) },
  });

  if (!email) {
    return res.json(GENERIC_FORGOT_SUCCESS);
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.json(GENERIC_FORGOT_SUCCESS);
  }

  const { record, rawToken } = await createPasswordResetToken(String(user._id));
  const resetLink = buildResetLink(rawToken);
  const delivery = await sendPasswordResetEmail({ toEmail: user.email, resetLink });

  await auditPasswordResetEvent({
    action: 'reset_email_sent',
    userId: String(user._id),
    outcome: 'allow',
    emailProviderState: providerState.state,
    resetTokenState: delivery.state,
    ip: req.ip,
    userAgent: req.get('user-agent') || undefined,
    metadata: {
      tokenExpiresAt: record.expiresAt.toISOString(),
      emailDeliveryState: delivery.state,
    },
  });

  return res.json(GENERIC_FORGOT_SUCCESS);
}

export async function resetPassword(req: Request, res: Response) {
  const rawToken = String(req.body?.token || '').trim();
  const password = String(req.body?.password || '');

  if (!rawToken || !isStrongPassword(password)) {
    await auditPasswordResetEvent({
      action: 'reset_password',
      outcome: 'deny',
      resetTokenState: rawToken ? 'TOKEN_OR_PASSWORD_INVALID' : 'TOKEN_MISSING',
      ip: req.ip,
      userAgent: req.get('user-agent') || undefined,
      metadata: { passwordAccepted: false },
    });
    return res.status(400).json(GENERIC_RESET_FAILURE);
  }

  const tokenRecord = await findUsablePasswordResetToken(rawToken);
  if (!tokenRecord) {
    await auditPasswordResetEvent({
      action: 'reset_token_rejected',
      outcome: 'deny',
      resetTokenState: 'INVALID_OR_EXPIRED',
      ip: req.ip,
      userAgent: req.get('user-agent') || undefined,
      metadata: { tokenValidated: false },
    });
    return res.status(400).json(GENERIC_RESET_FAILURE);
  }

  const user = await User.findById(tokenRecord.userId).select('+passwordHash');
  if (!user || !(user as any).passwordHash) {
    await auditPasswordResetEvent({
      action: 'reset_token_rejected',
      userId: String(tokenRecord.userId),
      outcome: 'deny',
      resetTokenState: 'USER_NOT_FOUND',
      ip: req.ip,
      userAgent: req.get('user-agent') || undefined,
      metadata: { tokenValidated: true },
    });
    return res.status(400).json(GENERIC_RESET_FAILURE);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  user.passwordHash = passwordHash;
  user.passwordChangedAt = new Date();
  await user.save();

  await markPasswordResetTokenUsed(String(tokenRecord._id));

  await auditPasswordResetEvent({
    action: 'reset_password',
    userId: String(user._id),
    outcome: 'allow',
    resetTokenState: 'USED_ONCE',
    ip: req.ip,
    userAgent: req.get('user-agent') || undefined,
    metadata: {
      tokenExpiresAt: tokenRecord.expiresAt.toISOString(),
      passwordChangedAt: user.passwordChangedAt.toISOString(),
      passwordAccepted: true,
    },
  });

  return res.json(GENERIC_RESET_SUCCESS);
}
