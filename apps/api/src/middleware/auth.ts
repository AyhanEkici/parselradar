import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { recordAccessDecision } from '../utils/accessAudit';
import { sessionIntegrityValidator } from '../session/sessionIntegrityValidator';
import { authConsistencyVerifier } from '../session/authConsistencyVerifier';
import { authSessionAudit } from '../session/authSessionAudit';
import { roleHydrationVerifier } from '../session/roleHydrationVerifier';


export interface AuthRequest extends Request {
  user?: {
    _id: string;
    email: string;
    name: string;
    role: 'USER' | 'ADMIN';
  };
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const deny = async (reason: string, userId?: string) => {
    await authSessionAudit({
      userId,
      role: undefined,
      decision: 'deny',
      reason,
      route: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('user-agent') || undefined,
    });
    return res.status(401).json({ error: 'Geçersiz oturum', code: reason });
  };

  let token: string | undefined;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }
  if (!token) {
    await recordAccessDecision({
      userId: undefined,
      role: undefined,
      resourceType: 'Auth',
      decision: 'deny',
      reason: 'missing_token',
      route: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('user-agent') || undefined,
    });
    return deny('MISSING_AUTH_TOKEN');
  }

  const integrity = sessionIntegrityValidator(token);
  if (!integrity.valid) {
    return deny(integrity.reason || 'TOKEN_VERIFICATION_FAILED', integrity.userId ? String(integrity.userId) : undefined);
  }

  try {
    const tokenUserId = integrity.userId;
    if (!tokenUserId) {
      return deny('TOKEN_PAYLOAD_MISSING_SUBJECT');
    }

    const user = await User.findById(tokenUserId);
    if (!user) {
      await recordAccessDecision({
        userId: String(tokenUserId),
        role: undefined,
        resourceType: 'Auth',
        resourceId: String(tokenUserId),
        decision: 'deny',
        reason: 'token_user_not_found',
        route: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('user-agent') || undefined,
      });
      return deny('TOKEN_VERIFIED_USER_NOT_FOUND', String(tokenUserId));
    }

    const consistency = authConsistencyVerifier({
      tokenUserId: String(tokenUserId),
      dbUserId: String(user._id),
      dbRole: user.role,
    });

    const passwordChangedAtMs = user.passwordChangedAt ? new Date(user.passwordChangedAt).getTime() : undefined;
    const tokenIssuedAtMs = integrity.issuedAt;
    // JWT iat is second precision while passwordChangedAt is milliseconds.
    // Accept tokens issued in the same login window with a strict 5-second tolerance.
    if (typeof passwordChangedAtMs === 'number' && typeof tokenIssuedAtMs === 'number' && passwordChangedAtMs > tokenIssuedAtMs + 5000) {
      await authSessionAudit({
        userId: String(user._id),
        role: user.role,
        decision: 'deny',
        reason: 'TOKEN_VERIFIED_PASSWORD_CHANGED_AFTER_IAT',
        route: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('user-agent') || undefined,
      });
      return res.status(401).json({ error: 'Geçersiz oturum', code: 'TOKEN_VERIFIED_PASSWORD_CHANGED_AFTER_IAT' });
    }

    if (!consistency.consistent) {
      const consistencyCode = consistency.reason === 'invalid_role_hydration'
        ? 'TOKEN_VERIFIED_ROLE_HYDRATION_FAILED'
        : 'TOKEN_VERIFIED_CONSISTENCY_FAILED';
      await authSessionAudit({
        userId: String(user._id),
        role: user.role,
        decision: 'deny',
        reason: consistencyCode,
        route: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('user-agent') || undefined,
      });
      return res.status(401).json({ error: 'Geçersiz oturum', code: consistencyCode });
    }

    req.user = {
      _id: String(user._id),
      email: user.email,
      name: user.name,
      role: roleHydrationVerifier(user.role).normalizedRole === 'ADMIN' ? 'ADMIN' : 'USER',
    };

    await authSessionAudit({
      userId: String(user._id),
      role: user.role,
      decision: 'allow',
      reason: 'session_verified',
      route: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('user-agent') || undefined,
    });
    next();
  } catch {
    await recordAccessDecision({
      userId: undefined,
      role: undefined,
      resourceType: 'Auth',
      decision: 'deny',
      reason: 'TOKEN_VERIFY_EXCEPTION',
      route: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('user-agent') || undefined,
    });
    return res.status(401).json({ error: 'Geçersiz oturum', code: 'TOKEN_VERIFY_EXCEPTION' });
  }
};

export const auth = requireAuth;
