import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';
import User from '../models/User';
import { recordAccessDecision } from '../utils/accessAudit';
import { sessionIntegrityValidator } from '../session/sessionIntegrityValidator';
import { authConsistencyVerifier } from '../session/authConsistencyVerifier';
import { authSessionAudit } from '../session/authSessionAudit';


export interface AuthRequest extends Request {
  user?: {
    _id: string;
    email: string;
    name: string;
    role: 'USER' | 'ADMIN';
  };
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }
  if (!token) {
    await authSessionAudit({
      userId: undefined,
      role: undefined,
      decision: 'deny',
      reason: 'missing_token',
      route: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('user-agent') || undefined,
    });
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
    return res.status(401).json({ error: 'Yetkisiz' });
  }

  const integrity = sessionIntegrityValidator(token);
  if (!integrity.valid) {
    await authSessionAudit({
      userId: integrity.userId,
      role: undefined,
      decision: 'deny',
      reason: integrity.reason,
      route: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('user-agent') || undefined,
    });
    return res.status(401).json({ error: 'Geçersiz oturum' });
  }

  try {
    const tokenUserId = integrity.userId;
    if (!tokenUserId) {
      return res.status(401).json({ error: 'Geçersiz oturum' });
    }

    const decoded = jwt.decode(token) as { iat?: number } | null;

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
      return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
    }

    const consistency = authConsistencyVerifier({
      tokenUserId: String(tokenUserId),
      dbUserId: String(user._id),
      dbRole: user.role,
    });

    const passwordChangedAt = user.passwordChangedAt ? new Date(user.passwordChangedAt).getTime() : undefined;
    const tokenIssuedAt = typeof decoded?.iat === 'number' ? decoded.iat * 1000 : undefined;
    // JWT iat is second-level precision; passwordChangedAt is millisecond precision.
    // Keep the skew window narrow so a just-issued token is not rejected by same-second drift.
    if (passwordChangedAt && tokenIssuedAt && tokenIssuedAt + 1000 < passwordChangedAt) {
      await authSessionAudit({
        userId: String(user._id),
        role: user.role,
        decision: 'deny',
        reason: 'password_changed',
        route: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('user-agent') || undefined,
      });
      return res.status(401).json({ error: 'Geçersiz oturum' });
    }

    if (!consistency.consistent) {
      await authSessionAudit({
        userId: String(user._id),
        role: user.role,
        decision: 'deny',
        reason: consistency.reason,
        route: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('user-agent') || undefined,
      });
      return res.status(401).json({ error: 'Geçersiz oturum' });
    }

    req.user = {
      _id: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role,
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
      reason: 'invalid_token',
      route: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('user-agent') || undefined,
    });
    return res.status(401).json({ error: 'Geçersiz oturum' });
  }
};

export const auth = requireAuth;
