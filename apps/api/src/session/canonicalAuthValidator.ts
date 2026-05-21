import jwt from 'jsonwebtoken';
import User from '../models/User';
import { JWT_SECRET } from '../config/env';

export const PASSWORD_CHANGED_AFTER_IAT_CODE = 'TOKEN_VERIFIED_PASSWORD_CHANGED_AFTER_IAT';
export const CANONICAL_AUTH_VALIDATION_SOURCE = 'canonicalAuthValidator' as const;
export const TOKEN_IAT_SKEW_MS = 15000;

export type SafeAuthUser = {
  _id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
};

export type CanonicalAuthValidationResult = {
  ok: boolean;
  statusCode: number;
  code: string;
  user?: SafeAuthUser;
  diagnostics: {
    tokenIatSeconds?: number;
    tokenIatMs?: number;
    passwordChangedAtIso?: string | null;
    passwordChangedAtMs?: number | null;
    deltaMs?: number | null;
    skewMs: number;
    invalidated: boolean;
    source: typeof CANONICAL_AUTH_VALIDATION_SOURCE;
    invalidationReason?: string | null;
  };
};

function toIsoOrNull(value: unknown): string | null {
  if (!value) return null;
  const parsed = new Date(value as string | number | Date);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function toMsOrNull(value: unknown): number | null {
  if (!value) return null;
  const parsed = new Date(value as string | number | Date).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

export async function validateAuthToken(token: string): Promise<CanonicalAuthValidationResult> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id?: string;
      userId?: string;
      sub?: string;
      exp?: number;
      iat?: number;
    };

    const subjectId = decoded?.id || decoded?.userId || decoded?.sub;
    const tokenIatSeconds = typeof decoded?.iat === 'number' ? decoded.iat : undefined;
    const tokenIatMs = typeof tokenIatSeconds === 'number' ? tokenIatSeconds * 1000 : undefined;

    if (!subjectId) {
      return {
        ok: false,
        statusCode: 401,
        code: 'TOKEN_PAYLOAD_MISSING_SUBJECT',
        diagnostics: {
          tokenIatSeconds,
          tokenIatMs,
          passwordChangedAtIso: null,
          passwordChangedAtMs: null,
          deltaMs: null,
          skewMs: TOKEN_IAT_SKEW_MS,
          invalidated: false,
          source: CANONICAL_AUTH_VALIDATION_SOURCE,
          invalidationReason: null,
        },
      };
    }

    const user = await User.findById(subjectId).select('_id email name role passwordChangedAt').lean();
    if (!user) {
      return {
        ok: false,
        statusCode: 401,
        code: 'TOKEN_VERIFIED_USER_NOT_FOUND',
        diagnostics: {
          tokenIatSeconds,
          tokenIatMs,
          passwordChangedAtIso: null,
          passwordChangedAtMs: null,
          deltaMs: null,
          skewMs: TOKEN_IAT_SKEW_MS,
          invalidated: false,
          source: CANONICAL_AUTH_VALIDATION_SOURCE,
          invalidationReason: null,
        },
      };
    }

    const passwordChangedAtIso = toIsoOrNull((user as { passwordChangedAt?: unknown }).passwordChangedAt);
    const passwordChangedAtMs = toMsOrNull((user as { passwordChangedAt?: unknown }).passwordChangedAt);
    const invalidPasswordChangedAt = (user as { passwordChangedAt?: unknown }).passwordChangedAt != null && passwordChangedAtMs === null;
    const deltaMs = typeof tokenIatMs === 'number' && typeof passwordChangedAtMs === 'number' ? passwordChangedAtMs - tokenIatMs : null;

    if (passwordChangedAtMs !== null && typeof tokenIatMs === 'number' && passwordChangedAtMs > tokenIatMs + TOKEN_IAT_SKEW_MS) {
      return {
        ok: false,
        statusCode: 401,
        code: PASSWORD_CHANGED_AFTER_IAT_CODE,
        diagnostics: {
          tokenIatSeconds,
          tokenIatMs,
          passwordChangedAtIso,
          passwordChangedAtMs,
          deltaMs,
          skewMs: TOKEN_IAT_SKEW_MS,
          invalidated: true,
          source: CANONICAL_AUTH_VALIDATION_SOURCE,
          invalidationReason: PASSWORD_CHANGED_AFTER_IAT_CODE,
        },
      };
    }

    return {
      ok: true,
      statusCode: 200,
      code: invalidPasswordChangedAt ? 'TOKEN_VERIFIED_INVALID_PASSWORD_CHANGED_AT' : 'TOKEN_VERIFIED',
      user: {
        _id: String(user._id),
        email: String(user.email),
        name: String(user.name),
        role: String(user.role).toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER',
      },
      diagnostics: {
        tokenIatSeconds,
        tokenIatMs,
        passwordChangedAtIso,
        passwordChangedAtMs,
        deltaMs,
        skewMs: TOKEN_IAT_SKEW_MS,
        invalidated: false,
        source: CANONICAL_AUTH_VALIDATION_SOURCE,
        invalidationReason: null,
      },
    };
  } catch {
    return {
      ok: false,
      statusCode: 401,
      code: 'INVALID_SIGNATURE',
      diagnostics: {
        passwordChangedAtIso: null,
        passwordChangedAtMs: null,
        deltaMs: null,
        skewMs: TOKEN_IAT_SKEW_MS,
        invalidated: false,
        source: CANONICAL_AUTH_VALIDATION_SOURCE,
        invalidationReason: null,
      },
    };
  }
}